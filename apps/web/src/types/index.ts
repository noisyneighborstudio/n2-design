export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface CLIAdapter {
  name: string;
  command: string;
  available: boolean;
  version?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AgentEvent {
  type: 'start' | 'output' | 'error' | 'complete';
  data: any;
}
