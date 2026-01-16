use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::json;
use zed_extension_api::{self as zed, LanguageServerId, SlashCommand, SlashCommandOutput};

#[derive(Serialize, Deserialize)]
struct IndexRequest {
    project_path: String,
    files: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize)]
struct QueryRequest {
    task: String,
    context: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize)]
struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    error: Option<ApiError>,
}

#[derive(Serialize, Deserialize)]
struct ApiError {
    code: String,
    message: String,
}

struct AITExtension {
    daemon_port: u16,
}

impl AITExtension {
    fn new() -> Self {
        Self {
            daemon_port: 3001, // Default, will be read from settings
        }
    }

    fn get_daemon_url(&self) -> String {
        format!("http://localhost:{}", self.daemon_port)
    }

    async fn check_daemon_connection(&self) -> Result<bool> {
        let client = reqwest::Client::new();
        let url = format!("{}/status", self.get_daemon_url());
        
        match client.get(&url).timeout(std::time::Duration::from_secs(2)).send().await {
            Ok(response) => Ok(response.status().is_success()),
            Err(_) => Ok(false),
        }
    }

    async fn index_project(&self, project_path: String) -> Result<String> {
        let client = reqwest::Client::new();
        let url = format!("{}/index", self.get_daemon_url());
        
        let request = IndexRequest {
            project_path,
            files: None,
        };

        let response: ApiResponse<serde_json::Value> = client
            .post(&url)
            .json(&request)
            .send()
            .await
            .context("Failed to send index request")?
            .json()
            .await
            .context("Failed to parse response")?;

        if response.success {
            if let Some(data) = response.data {
                if let Some(files_indexed) = data.get("files_indexed") {
                    Ok(format!("Indexed {} files successfully", files_indexed))
                } else {
                    Ok("Project indexed successfully".to_string())
                }
            } else {
                Ok("Project indexed successfully".to_string())
            }
        } else {
            Err(anyhow::anyhow!(
                response.error.map(|e| e.message).unwrap_or_else(|| "Unknown error".to_string())
            ))
        }
    }

    async fn query_daemon(&self, task: String, context: Option<serde_json::Value>) -> Result<String> {
        let client = reqwest::Client::new();
        let url = format!("{}/query", self.get_daemon_url());
        
        let mut request_context = context.unwrap_or_else(|| json!({}));
        if let Some(obj) = request_context.as_object_mut() {
            obj.insert("task".to_string(), json!(task.clone()));
        }

        let request = QueryRequest {
            task: task.clone(),
            context: Some(request_context),
        };

        let response: ApiResponse<serde_json::Value> = client
            .post(&url)
            .json(&request)
            .timeout(std::time::Duration::from_secs(60))
            .send()
            .await
            .context("Failed to send query request")?
            .json()
            .await
            .context("Failed to parse response")?;

        if response.success {
            if let Some(data) = response.data {
                if let Some(result) = data.get("result") {
                    if let Some(result_data) = result.get("data") {
                        Ok(serde_json::to_string_pretty(result_data)
                            .unwrap_or_else(|_| "Query completed".to_string()))
                    } else {
                        Ok("Query completed".to_string())
                    }
                } else {
                    Ok("Query completed".to_string())
                }
            } else {
                Ok("Query completed".to_string())
            }
        } else {
            Err(anyhow::anyhow!(
                response.error.map(|e| e.message).unwrap_or_else(|| "Unknown error".to_string())
            ))
        }
    }
}

#[zed_extension_api::register_extension]
impl zed::Extension for AITExtension {
    fn new() -> Self {
        Self::new()
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        // Not implementing LSP, using HTTP API instead
        Err(zed::Error {
            code: zed::ErrorCode::Unknown,
            message: "Not a language server extension".to_string(),
        })
    }

    async fn handle_slash_command(
        &mut self,
        command: SlashCommand,
        worktree: &zed::Worktree,
        cx: &mut zed::SlashCommandContext,
    ) -> zed::Result<SlashCommandOutput> {
        // Check daemon connection first
        if !self.check_daemon_connection().await.unwrap_or(false) {
            return Ok(SlashCommandOutput {
                text: "Error: AIT daemon is not running.\n\nPlease start it with:\n```bash\ncd daemon\nnpm start <project-path>\n```".to_string(),
            });
        }

        let project_path = worktree.root_path().to_string_lossy().to_string();

        match command.name.as_str() {
            "explain_file" => {
                // Get current file path if available
                let task = if let Some(buffer) = cx.current_buffer() {
                    let file_path = buffer.file_path();
                    format!("Explain this file: {}", file_path.display())
                } else {
                    "Explain the current file".to_string()
                };
                
                let context = if let Some(buffer) = cx.current_buffer() {
                    Some(json!({
                        "current_file": buffer.file_path().to_string_lossy().to_string(),
                    }))
                } else {
                    None
                };

                match self.query_daemon(task, context).await {
                    Ok(result) => Ok(SlashCommandOutput {
                        text: format!("## File Explanation\n\n{}", result),
                    }),
                    Err(e) => Ok(SlashCommandOutput {
                        text: format!("Error: {}", e),
                    }),
                }
            }

            "refactor_function" => {
                let refactoring_type = command.arg.unwrap_or_else(|| "Improve code quality".to_string());
                let task = format!("Refactor this function: {}", refactoring_type);
                
                // Get current file and selection from context
                let context = if let Some(buffer) = cx.current_buffer() {
                    let file_path = buffer.file_path();
                    let selection = cx.selected_text().unwrap_or_default();
                    Some(json!({
                        "current_file": file_path.to_string_lossy().to_string(),
                        "current_symbol": selection,
                        "files": [file_path.to_string_lossy().to_string()],
                    }))
                } else {
                    None
                };
                
                match self.query_daemon(task, context).await {
                    Ok(result) => Ok(SlashCommandOutput {
                        text: format!("## Refactoring Result\n\n{}", result),
                    }),
                    Err(e) => Ok(SlashCommandOutput {
                        text: format!("Error: {}", e),
                    }),
                }
            }

            "debug_test" => {
                let task = "Why does this test fail? Analyze the test file and related code.".to_string();
                
                // Get current file from context
                let context = if let Some(buffer) = cx.current_buffer() {
                    let file_path = buffer.file_path();
                    Some(json!({
                        "current_file": file_path.to_string_lossy().to_string(),
                        "files": [file_path.to_string_lossy().to_string()],
                    }))
                } else {
                    None
                };
                
                match self.query_daemon(task, context).await {
                    Ok(result) => Ok(SlashCommandOutput {
                        text: format!("## Test Analysis\n\n{}", result),
                    }),
                    Err(e) => Ok(SlashCommandOutput {
                        text: format!("Error: {}", e),
                    }),
                }
            }

            "summarize_standards" => {
                let task = "Summarize project conventions and standards".to_string();
                match self.query_daemon(task, None).await {
                    Ok(result) => Ok(SlashCommandOutput {
                        text: format!("## Project Standards\n\n{}", result),
                    }),
                    Err(e) => Ok(SlashCommandOutput {
                        text: format!("Error: {}", e),
                    }),
                }
            }

            "index_project" => {
                match self.index_project(project_path).await {
                    Ok(result) => Ok(SlashCommandOutput {
                        text: format!("## Indexing Result\n\n{}", result),
                    }),
                    Err(e) => Ok(SlashCommandOutput {
                        text: format!("Error: {}", e),
                    }),
                }
            }

            _ => Ok(SlashCommandOutput {
                text: format!("Unknown command: {}", command.name),
            }),
        }
    }
}
