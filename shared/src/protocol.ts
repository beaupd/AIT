import type { IndexRequest, IndexResponse, QueryRequest, QueryResponse, StatusResponse, DbStatsResponse } from './types';

// Extension-daemon communication protocol
export const PROTOCOL_VERSION = '1.0.0';

export interface ProtocolError {
  code: string;
  message: string;
  details?: unknown;
}

// Error codes
export enum ErrorCode {
  DAEMON_NOT_RUNNING = 'DAEMON_NOT_RUNNING',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INDEXING_FAILED = 'INDEXING_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  INSUFFICIENT_CONTEXT = 'INSUFFICIENT_CONTEXT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  LLM_ERROR = 'LLM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// API endpoints
export const API_ENDPOINTS = {
  INDEX: '/index',
  QUERY: '/query',
  STATUS: '/status',
  DB_STATS: '/db/stats',
} as const;

// Request/Response types
export type ApiRequest<T = unknown> = T;
export type ApiResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: ProtocolError };

export type IndexApiRequest = IndexRequest;
export type IndexApiResponse = ApiResponse<IndexResponse>;

export type QueryApiRequest = QueryRequest;
export type QueryApiResponse = ApiResponse<QueryResponse>;

export type StatusApiResponse = ApiResponse<StatusResponse>;

export type DbStatsApiResponse = ApiResponse<DbStatsResponse>;
