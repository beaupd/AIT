#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import type { IndexRequest, QueryRequest } from '@ait/shared';
import { API_ENDPOINTS } from '@ait/shared';

const program = new Command();

program
  .name('ait')
  .description('Local Structured AI Coding Assistant CLI')
  .version('0.1.0');

const DEFAULT_PORT = 3001;
const DEFAULT_URL = `http://localhost:${DEFAULT_PORT}`;

function createClient(port?: number) {
  const baseUrl = port ? `http://localhost:${port}` : DEFAULT_URL;
  return axios.create({
    baseURL: baseUrl,
    timeout: 30000,
  });
}

program
  .command('index')
  .description('Index a project')
  .argument('<project-path>', 'Path to the project to index')
  .option('-p, --port <port>', 'Daemon port', DEFAULT_PORT.toString())
  .option('-f, --files <files...>', 'Specific files to index')
  .action(async (projectPath: string, options: { port?: string; files?: string[] }) => {
    const client = createClient(options.port ? parseInt(options.port, 10) : undefined);
    
    try {
      const request: IndexRequest = {
        project_path: projectPath,
        files: options.files,
      };

      console.log(`Indexing project: ${projectPath}...`);
      const response = await client.post(API_ENDPOINTS.INDEX, request);
      
      if (response.data.success) {
        console.log(`✓ Indexed ${response.data.data.files_indexed} files`);
      } else {
        console.error(`✗ Error: ${response.data.error.message}`);
        process.exit(1);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Failed to connect to daemon: ${error.message}`);
        console.error('Make sure the daemon is running: npm start in daemon/ directory');
      } else {
        console.error(`✗ Error: ${error}`);
      }
      process.exit(1);
    }
  });

program
  .command('query')
  .description('Execute a query task')
  .argument('<task>', 'Task description')
  .option('-p, --port <port>', 'Daemon port', DEFAULT_PORT.toString())
  .option('-f, --file <file>', 'Current file context')
  .action(async (task: string, options: { port?: string; file?: string }) => {
    const client = createClient(options.port ? parseInt(options.port, 10) : undefined);
    
    try {
      const request: QueryRequest = {
        task,
        context: options.file ? { task, current_file: options.file } : { task },
      };

      console.log(`Executing task: ${task}...`);
      const response = await client.post(API_ENDPOINTS.QUERY, request);
      
      if (response.data.success) {
        console.log('\nResult:');
        console.log(JSON.stringify(response.data.data.result?.data, null, 2));
      } else {
        console.error(`✗ Error: ${response.data.error.message}`);
        process.exit(1);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Failed to connect to daemon: ${error.message}`);
        console.error('Make sure the daemon is running: npm start in daemon/ directory');
      } else {
        console.error(`✗ Error: ${error}`);
      }
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check daemon status')
  .option('-p, --port <port>', 'Daemon port', DEFAULT_PORT.toString())
  .action(async (options: { port?: string }) => {
    const client = createClient(options.port ? parseInt(options.port, 10) : undefined);
    
    try {
      const response = await client.get(API_ENDPOINTS.STATUS);
      
      if (response.data.success) {
        const status = response.data.data;
        console.log('Daemon Status:');
        console.log(`  Running: ${status.running ? '✓' : '✗'}`);
        console.log(`  Version: ${status.version}`);
        if (status.db_path) {
          console.log(`  Database: ${status.db_path}`);
        }
      } else {
        console.error(`✗ Error: ${response.data.error.message}`);
        process.exit(1);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Failed to connect to daemon: ${error.message}`);
        console.error('Make sure the daemon is running: npm start in daemon/ directory');
      } else {
        console.error(`✗ Error: ${error}`);
      }
      process.exit(1);
    }
  });

program
  .command('db:stats')
  .description('Show database statistics')
  .option('-p, --port <port>', 'Daemon port', DEFAULT_PORT.toString())
  .action(async (options: { port?: string }) => {
    const client = createClient(options.port ? parseInt(options.port, 10) : undefined);
    
    try {
      const response = await client.get(API_ENDPOINTS.DB_STATS);
      
      if (response.data.success) {
        const stats = response.data.data;
        console.log('Database Statistics:');
        console.log(`  Files: ${stats.files_count}`);
        console.log(`  Symbols: ${stats.symbols_count}`);
        console.log(`  Relations: ${stats.relations_count}`);
        console.log(`  Standards: ${stats.standards_count}`);
        console.log(`  Embeddings: ${stats.embeddings_count}`);
      } else {
        console.error(`✗ Error: ${response.data.error.message}`);
        process.exit(1);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`✗ Failed to connect to daemon: ${error.message}`);
        console.error('Make sure the daemon is running: npm start in daemon/ directory');
      } else {
        console.error(`✗ Error: ${error}`);
      }
      process.exit(1);
    }
  });

program.parse();
