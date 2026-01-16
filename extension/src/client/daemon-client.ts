import axios, { AxiosInstance } from 'axios';
import type { IndexRequest, QueryRequest, StatusResponse, DbStatsResponse } from '@ait/shared';
import { API_ENDPOINTS, ErrorCode, type IndexApiResponse, type QueryApiResponse, type StatusApiResponse, type DbStatsApiResponse } from '@ait/shared';

export class DaemonClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(port: number = 3001) {
    this.baseUrl = `http://localhost:${port}`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get<StatusApiResponse>(API_ENDPOINTS.STATUS);
      return response.data.success && response.data.data.running;
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<StatusResponse> {
    const response = await this.client.get<StatusApiResponse>(API_ENDPOINTS.STATUS);
    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }
    return response.data.data;
  }

  async getDbStats(): Promise<DbStatsResponse> {
    const response = await this.client.get<DbStatsApiResponse>(API_ENDPOINTS.DB_STATS);
    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }
    return response.data.data;
  }

  async index(request: IndexRequest): Promise<{ files_indexed: number }> {
    const response = await this.client.post<IndexApiResponse>(API_ENDPOINTS.INDEX, request);
    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }
    return response.data.data;
  }

  async query(request: QueryRequest): Promise<unknown> {
    const response = await this.client.post<QueryApiResponse>(API_ENDPOINTS.QUERY, request);
    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }
    return response.data.data.result?.data;
  }
}
