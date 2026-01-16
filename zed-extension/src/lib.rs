use serde::{Deserialize, Serialize};
use zed_extension_api::{self as zed, Extension, SlashCommand, SlashCommandOutput, SlashCommandOutputSection, Range};

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
            daemon_port: 3001,
        }
    }

    fn get_daemon_url(&self) -> String {
        format!("http://localhost:{}", self.daemon_port)
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
}

impl Extension for AITExtension {
    fn new() -> Self {
        AITExtension::new()
    }

    fn run_slash_command(
        &self,
        command: SlashCommand,
        args: Vec<String>,
        worktree: Option<&zed::Worktree>,
    ) -> Result<SlashCommandOutput, String> {
        let project_path = worktree.map(|w| w.root_path()).unwrap_or_else(|| ".".to_string());

        // Note: HTTP requests need to use Zed's API
        // This is a simplified version that will need HTTP implementation
        // once the exact API is confirmed
        
        match command.name.as_str() {
            "explain_file" => {
                Ok(self.create_output(
                    "## File Explanation\n\nThis feature requires HTTP API implementation.\n\nPlease ensure the AIT daemon is running:\n```bash\ncd daemon\nnpm start <project-path>\n```".to_string()
                ))
            }

            "refactor_function" => {
                // Get argument from args vector
                let refactoring_type = args.first().map(|s| s.as_str()).unwrap_or("Improve code quality");
                
                Ok(self.create_output(
                    format!("## Refactoring Result\n\nRefactoring: {}\n\nThis feature requires HTTP API implementation.", refactoring_type)
                ))
            }

            "debug_test" => {
                Ok(self.create_output(
                    "## Test Analysis\n\nThis feature requires HTTP API implementation.\n\nPlease ensure the AIT daemon is running.".to_string()
                ))
            }

            "summarize_standards" => {
                Ok(self.create_output(
                    "## Project Standards\n\nThis feature requires HTTP API implementation.\n\nPlease ensure the AIT daemon is running.".to_string()
                ))
            }

            "index_project" => {
                Ok(self.create_output(
                    format!("## Indexing Result\n\nProject path: {}\n\nThis feature requires HTTP API implementation.\n\nPlease ensure the AIT daemon is running.", project_path)
                ))
            }

            _ => Ok(self.create_output(format!("Unknown command: {}", command.name))),
        }
    }
}

zed_extension_api::register_extension!(AITExtension);
