import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface PreviewPanelProps {
  projectId: string;
}

export function PreviewPanel({ projectId }: PreviewPanelProps) {
  const [htmlFiles, setHtmlFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    loadHtmlFiles();
    const interval = setInterval(loadHtmlFiles, 2000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  const loadHtmlFiles = async () => {
    try {
      const files = await api.getProjectFiles(projectId);
      const htmls = files.filter((f: string) => f.endsWith('.html'));
      setHtmlFiles(htmls);
      if (htmls.length > 0 && !selectedFile) {
        setSelectedFile(htmls[0]);
      }
    } catch (error) {
      console.error('Failed to load HTML files:', error);
    }
  };

  const loadFileContent = async (file: string) => {
    try {
      const data = await api.readFile(projectId, file);
      setContent(data);
    } catch (error) {
      console.error('Failed to load file content:', error);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        Preview
        {htmlFiles.length > 1 && (
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            style={{ marginLeft: '12px', fontSize: '12px' }}
          >
            {htmlFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="panel-content" style={{ padding: 0 }}>
        {content ? (
          <iframe
            className="preview-frame"
            srcDoc={content}
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        ) : (
          <div className="empty-state">
            <p>No HTML files to preview yet</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              Ask the agent to generate HTML files
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
