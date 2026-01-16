use serde::{Deserialize, Serialize};
use zed_extension_api::{self as zed, Extension, SlashCommand, SlashCommandOutput, SlashCommandOutputSection, Range};

// Note: HTTP API types may need to be imported from zed_extension_api::http module
// The exact structure depends on zed_extension_api 0.7.0 implementation
// Common patterns: zed::http::HttpRequest, zed::http::HttpMethod, or direct exports

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

#[derive(Serialize, Deserialize)]
struct StatusResponse {
    running: bool,
    version: String,
}

struct AITExtension;

impl AITExtension {
    fn new() -> Self {
        Self
    }

    fn get_daemon_port(&self) -> u16 {
        // Get daemon port from settings, default to 3001
        // Note: Settings access may need to be implemented via Extension trait methods
        3001
    }

    fn get_daemon_url(&self) -> String {
        format!("http://localhost:{}", self.get_daemon_port())
    }

    fn create_output(&self, text: String) -> SlashCommandOutput {
        // Create a default range for the section (start and end are u32 offsets)
        let range = Range {
            start: 0,
            end: 0,
        };
        
        SlashCommandOutput {
            text: text.clone(),
            sections: vec![SlashCommandOutputSection {
                range,
                label: text,
            }],
        }
    }

    fn create_error_output(&self, error: String) -> SlashCommandOutput {
        self.create_output(format!("## Error\n\n{}", error))
    }

    fn check_daemon_connection(&self) -> Result<bool, String> {
        // HTTP API implementation
        // Note: The exact API structure for zed_extension_api 0.7.0 may need verification
        // Common patterns include:
        // - zed::http::request() or zed::http_request()
        // - Types: zed::http::HttpRequest, zed::http::HttpMethod
        // For now, return a placeholder that indicates HTTP needs to be implemented
        // Once the exact API is confirmed, uncomment and adjust the code below
        
        // Placeholder: Assume daemon is running if we can't check
        // TODO: Implement actual HTTP request using zed_extension_api HTTP module
        Ok(true)
    }

    fn make_http_request(&self, _method: &str, endpoint: &str, body: Option<String>) -> Result<String, String> {
        // HTTP request implementation placeholder
        // TODO: Implement using zed_extension_api HTTP API
        // Example structure (may need adjustment):
        /*
        use zed_extension_api::http::{HttpRequest, HttpMethod};
        
        let url = format!("{}{}", self.get_daemon_url(), endpoint);
        let method = match _method {
            "GET" => HttpMethod::Get,
            "POST" => HttpMethod::Post,
            _ => return Err("Unsupported method".to_string()),
        };
        
        let request = HttpRequest {
            method,
            url,
            headers: vec![("Content-Type".to_string(), "application/json".to_string())],
            body,
        };
        
        match zed::http::request(request) {
            Ok(response) => {
                if response.status_code >= 200 && response.status_code < 300 {
                    Ok(response.body)
                } else {
                    Err(format!("HTTP {}: {}", response.status_code, response.body))
                }
            }
            Err(e) => Err(format!("HTTP request failed: {}", e)),
        }
        */
        
        // Placeholder error for now
        Err(format!("HTTP API not yet implemented. Endpoint: {}, Body: {:?}", endpoint, body.is_some()))
    }

    fn index_project(&self, project_path: String, files: Option<Vec<String>>) -> Result<String, String> {
        let request = IndexRequest {
            project_path,
            files,
        };

        let body = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        self.make_http_request("POST", "/index", Some(body))
    }

    fn query_daemon(&self, task: String, context: Option<serde_json::Value>) -> Result<String, String> {
        let request = QueryRequest {
            task,
            context,
        };

        let body = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        self.make_http_request("POST", "/query", Some(body))
    }
}

impl Extension for AITExtension {
    fn new() -> Self {
        AITExtension::new()
    }

    fn run_slash_command(
        &self,
        command: SlashCommand,
        args: Vec<String>,
        workspace: Option<&zed::Worktree>,
    ) -> Result<SlashCommandOutput, String> {
        let project_path = workspace.map(|w| w.root_path()).unwrap_or_else(|| ".".to_string());

        // Note: HTTP API implementation is pending
        // Once zed_extension_api 0.7.0 HTTP API is confirmed, uncomment daemon check:
        /*
        match self.check_daemon_connection() {
            Ok(true) => {
                // Daemon is running, proceed with commands
            }
            Ok(false) => {
                return Ok(self.create_error_output(
                    "AIT daemon is not running. Please start it with:\n```bash\ncd daemon\nnpm start <project-path>\n```".to_string()
                ));
            }
            Err(e) => {
                return Ok(self.create_error_output(format!(
                    "Failed to connect to AIT daemon: {}\n\nPlease ensure the daemon is running on port {}.",
                    e, self.get_daemon_port()
                )));
            }
        }
        */
        
        match command.name.as_str() {
            "explain_file" => {
                // TODO: Implement HTTP request to daemon once API is confirmed
                Ok(self.create_output(
                    format!("## File Explanation\n\nHTTP API implementation pending.\n\nProject path: {}\n\nPlease ensure the AIT daemon is running:\n```bash\ncd daemon\nnpm start <project-path>\n```\n\nOnce HTTP API is implemented, this will query the daemon for file explanations.", project_path)
                ))
            }

            "refactor_function" => {
                let refactoring_type = args.first().map(|s| s.as_str()).unwrap_or("Improve code quality");
                // TODO: Implement HTTP request to daemon once API is confirmed
                Ok(self.create_output(
                    format!("## Refactoring Result\n\nRefactoring: {}\n\nHTTP API implementation pending.\n\nOnce HTTP API is implemented, this will query the daemon for refactoring suggestions.", refactoring_type)
                ))
            }

            "debug_test" => {
                // TODO: Implement HTTP request to daemon once API is confirmed
                Ok(self.create_output(
                    format!("## Test Analysis\n\nHTTP API implementation pending.\n\nProject path: {}\n\nOnce HTTP API is implemented, this will query the daemon for test debugging analysis.", project_path)
                ))
            }

            "summarize_standards" => {
                // TODO: Implement HTTP request to daemon once API is confirmed
                Ok(self.create_output(
                    "## Project Standards\n\nHTTP API implementation pending.\n\nOnce HTTP API is implemented, this will query the daemon for project standards summary.".to_string()
                ))
            }

            "index_project" => {
                // TODO: Implement HTTP request to daemon once API is confirmed
                Ok(self.create_output(
                    format!("## Indexing Result\n\nProject path: {}\n\nHTTP API implementation pending.\n\nOnce HTTP API is implemented, this will send an indexing request to the daemon.", project_path)
                ))
            }

            _ => Ok(self.create_output(format!("Unknown command: {}", command.name))),
        }
    }
}

zed::register_extension!(AITExtension);
