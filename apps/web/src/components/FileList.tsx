import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface FileListProps {
  projectId: string;
}

export function FileList({ projectId }: FileListProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
    const interval = setInterval(loadFiles, 2000);
    return () => clearInterval(interval);
  }, [projectId]);

  const loadFiles = async () => {
    try {
      const data = await api.getProjectFiles(projectId);
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleSelectFile = (file: string) => {
    setSelectedFile(file);
  };

  return (
    <div className="panel">
      <div className="panel-header">Files</div>
      <div className="panel-content">
        {files.length === 0 ? (
          <div className="empty-state">
            <p>No files yet</p>
          </div>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li
                key={file}
                className="file-item"
                onClick={() => handleSelectFile(file)}
                style={{
                  background: selectedFile === file ? '#f5f5f5' : 'transparent'
                }}
              >
                {file}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
