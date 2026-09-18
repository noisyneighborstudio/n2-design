export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CLIAdapter {
  name: 'claude' | 'codex' | 'grok';
  command: string;
  available: boolean;
  version?: string;
}

export interface AgentTask {
  id: string;
  projectId: string;
  prompt: string;
  cliAdapter: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  output?: string;
  error?: string;
}

export interface ExportResult {
  zipPath: string;
  screenshotPaths: string[];
}
