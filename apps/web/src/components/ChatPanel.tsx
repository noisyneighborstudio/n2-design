import { useState, useEffect, useRef } from 'react';
import { Project, ChatMessage } from '../types';

interface ChatPanelProps {
  project: Project;
  adapter: string;
}

export function ChatPanel({ project, adapter }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isExecuting || !adapter) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsExecuting(true);

    try {
      const response = await fetch('/api/agent/' + project.id + '/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, adapter })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) throw new Error('No response body');

      const assistantMessageId = Date.now().toString();
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.data) {
              if (isFirstChunk) {
                const assistantMessage: ChatMessage = {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: data.data,
                  timestamp: new Date()
                };
                setMessages((prev) => [...prev, assistantMessage]);
                isFirstChunk = false;
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex]?.id === assistantMessageId) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: updated[lastIndex].content + data.data
                    };
                  }
                  return updated;
                });
              }
            }
          }
        }
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">Chat</div>
      <div className="panel-content chat-panel-content">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <p>Send a message to start generating your prototype</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
              placeholder={
                adapter 
                  ? "Describe what you want to build..." 
                  : "Select a CLI adapter first"
              }
              disabled={isExecuting || !adapter}
            />
            <button onClick={handleSend} disabled={isExecuting || !adapter || !input.trim()}>
              {isExecuting ? 'Generating...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
