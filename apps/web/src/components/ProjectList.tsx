import { useState } from 'react';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onCreate: (name: string, description?: string) => void;
}

export function ProjectList({ projects, onSelect, onCreate }: ProjectListProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name, description || undefined);
      setName('');
      setDescription('');
      setShowModal(false);
    }
  };

  return (
    <div className="panel-content">
      <div className="empty-state">
        <h3>Welcome to N2 Design</h3>
        <p>Create a new project or select an existing one to get started</p>
        <button onClick={() => setShowModal(true)}>New Project</button>

        {projects.length > 0 && (
          <div style={{ marginTop: '32px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '16px' }}>Recent Projects</h3>
            <ul className="project-list">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="project-item"
                  onClick={(e) => {
                    console.log('Project item clicked:', project.name, e);
                    onSelect(project);
                  }}
                >
                  <h3>{project.name}</h3>
                  {project.description && <p>{project.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-awesome-prototype"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
