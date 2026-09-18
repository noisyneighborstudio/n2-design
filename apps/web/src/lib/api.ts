const API_BASE = '/api';

export const api = {
  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async createProject(name: string, description?: string) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async getProject(id: string) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async deleteProject(id: string) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  async getProjectFiles(id: string) {
    const res = await fetch(`${API_BASE}/projects/${id}/files`);
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  },

  async readFile(projectId: string, filePath: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/files/${filePath}`);
    if (!res.ok) throw new Error('Failed to read file');
    return res.text();
  },

  // CLI Adapters
  async getCLIAdapters() {
    const res = await fetch(`${API_BASE}/cli`);
    if (!res.ok) throw new Error('Failed to fetch CLI adapters');
    return res.json();
  },

  // Agent execution
  executeAgent(projectId: string, prompt: string, adapter: string) {
    return new EventSource(
      `${API_BASE}/agent/${projectId}/execute?` + 
      new URLSearchParams({ prompt, adapter })
    );
  },

  // Export
  async exportProject(projectId: string) {
    const res = await fetch(`${API_BASE}/export/${projectId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to export project');
    return res.blob();
  }
};
