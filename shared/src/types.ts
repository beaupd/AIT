// Database types
export interface File {
  id: number;
  path: string;
  language: string;
  role: FileRole;
  summary: string | null;
  stability: Stability;
  created_at: number;
  updated_at: number;
}

export type FileRole = 'core' | 'test' | 'config' | 'docs' | 'other';
export type Stability = 'stable' | 'experimental';

export interface Symbol {
  id: number;
  file_id: number;
  name: string;
  type: SymbolType;
  visibility: Visibility;
  summary: string | null;
  line_start: number;
  line_end: number;
}

export type SymbolType = 'function' | 'class' | 'constant' | 'interface' | 'type' | 'variable';
export type Visibility = 'public' | 'private' | 'protected' | 'internal';

export interface Relation {
  id: number;
  source_type: EntityType;
  source_id: number;
  target_type: EntityType;
  target_id: number;
  relation_type: RelationType;
}

export type EntityType = 'file' | 'symbol';
export type RelationType = 'imports' | 'calls' | 'mirrors' | 'extends' | 'implements';

export interface Standard {
  id: number;
  category: StandardCategory;
  rule_text: string;
  examples: string | null;
}

export type StandardCategory = 'naming' | 'error_handling' | 'logging' | 'architecture' | 'testing' | 'other';

export interface Embedding {
  id: number;
  entity_type: EntityType | 'standard';
  entity_id: number;
  embedding_vector: number[];
  model_name: string;
}

// Agent types
export interface AgentContext {
  task?: string;
  files?: string[];
  symbols?: string[];
  current_file?: string;
  current_symbol?: string;
  query?: string;
  [key: string]: unknown;
}

export interface AgentResult {
  success: boolean;
  data?: unknown;
  error?: string;
  context?: AgentContext;
}

// Protocol types
export interface IndexRequest {
  project_path: string;
  files?: string[]; // If provided, only index these files
}

export interface IndexResponse {
  success: boolean;
  files_indexed: number;
  error?: string;
}

export interface QueryRequest {
  task: string;
  context?: AgentContext;
}

export interface QueryResponse {
  success: boolean;
  result?: AgentResult;
  error?: string;
}

export interface StatusResponse {
  running: boolean;
  version: string;
  db_path?: string;
}

export interface DbStatsResponse {
  files_count: number;
  symbols_count: number;
  relations_count: number;
  standards_count: number;
  embeddings_count: number;
}
