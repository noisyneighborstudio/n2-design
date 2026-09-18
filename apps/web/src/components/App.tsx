import { useState, useEffect } from 'react';
import { Project, CLIAdapter } from '../types';
import { api } from '../lib/api';
import { ProjectList } from './ProjectList';
import { ChatPanel } from './ChatPanel';
import { FileList } from './FileList';
import { PreviewPanel } from './PreviewPanel';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [cliAdapters, setCLIAdapters] = useState<CLIAdapter[]>([]);
  const [selectedAdapter, setSelectedAdapter] = useState<string>('');

  useEffect(() => {
    loadProjects();
    loadCLIAdapters();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadCLIAdapters = async () => {
    try {
      const data = await api.getCLIAdapters();
      setCLIAdapters(data);
      const available = data.find((a: CLIAdapter) => a.available);
      if (available) {
        setSelectedAdapter(available.name);
      }
    } catch (error) {
      console.error('Failed to load CLI adapters:', error);
    }
  };

  const handleCreateProject = async (name: string, description?: string) => {
    try {
      const project = await api.createProject(name, description);
      setProjects([...projects, project]);
      setCurrentProject(project);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
  };

  const handleExport = async () => {
    if (!currentProject) return;
    
    try {
      const blob = await api.exportProject(currentProject.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name}-export.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
      alert('Export failed. Make sure the project has generated files.');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>N2 Design v0.1</h1>
        <div className="header-actions">
          <select
            className="cli-select"
            value={selectedAdapter}
            onChange={(e) => setSelectedAdapter(e.target.value)}
            disabled={cliAdapters.length === 0}
          >
            {cliAdapters.length === 0 && (
              <option>No CLI adapters available</option>
            )}
            {cliAdapters.map((adapter) => (
              <option 
                key={adapter.name} 
                value={adapter.name}
                disabled={!adapter.available}
              >
                {adapter.name} {adapter.available ? '✓' : '✗'}
              </option>
            ))}
          </select>
          {currentProject && (
            <button onClick={handleExport}>Export ZIP</button>
          )}
        </div>
      </header>

      {!currentProject ? (
        <ProjectList
          projects={projects}
          onSelect={handleSelectProject}
          onCreate={handleCreateProject}
        />
      ) : (
        <div className="workspace">
          <FileList projectId={currentProject.id} />
          <ChatPanel
            project={currentProject}
            adapter={selectedAdapter}
          />
          <PreviewPanel projectId={currentProject.id} />
        </div>
      )}
    </div>
  );
}
