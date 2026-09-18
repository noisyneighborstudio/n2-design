import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import { CLIAdapter } from '../types';

const execAsync = promisify(exec);

export class CLIAdapterService {
  private adapters: Map<string, CLIAdapter> = new Map();

  async detectAvailableCLIs(): Promise<CLIAdapter[]> {
    const adapters: CLIAdapter[] = [
      { name: 'claude', command: 'claude', available: false },
      { name: 'codex', command: 'codex', available: false },
      { name: 'grok', command: 'grok', available: false }
    ];

    for (const adapter of adapters) {
      try {
        await execAsync(`which ${adapter.command}`);
        try {
          const { stdout } = await execAsync(`${adapter.command} --version`);
          adapter.version = stdout.trim();
        } catch {
          adapter.version = 'unknown';
        }
        adapter.available = true;
      } catch {
        adapter.available = false;
      }
      this.adapters.set(adapter.name, adapter);
    }

    return adapters;
  }

  getAdapter(name: string): CLIAdapter | undefined {
    return this.adapters.get(name);
  }

  async executeCommand(
    adapterName: string,
    projectPath: string,
    prompt: string,
    onOutput: (data: string) => void,
    onError: (data: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    const adapter = this.adapters.get(adapterName);
    
    if (!adapter) {
      return { 
        success: false, 
        error: `CLI adapter '${adapterName}' not found. Available: ${Array.from(this.adapters.keys()).join(', ')}` 
      };
    }

    if (!adapter.available) {
      return {
        success: false,
        error: `CLI '${adapter.command}' is not installed or not found in PATH.\n\nInstallation hints:\n` +
               `- claude: Follow https://claude.ai/download\n` +
               `- codex: npm install -g @openai/codex-cli\n` +
               `- grok: Follow https://grok.x.ai/cli`
      };
    }

    return new Promise((resolve) => {
      const args = this.buildCommandArgs(adapterName, prompt);
      const child = spawn(adapter.command, args, {
        cwd: projectPath,
        env: { ...process.env },
        shell: true
      });

      child.stdout.on('data', (data) => {
        onOutput(data.toString());
      });

      child.stderr.on('data', (data) => {
        onError(data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ 
            success: false, 
            error: `Command exited with code ${code}` 
          });
        }
      });

      child.on('error', (err) => {
        resolve({ 
          success: false, 
          error: `Failed to spawn ${adapter.command}: ${err.message}` 
        });
      });
    });
  }

  private buildCommandArgs(adapterName: string, prompt: string): string[] {
    switch (adapterName) {
      case 'claude':
        return ['--prompt', prompt];
      case 'codex':
        return ['generate', '--prompt', prompt];
      case 'grok':
        return ['code', '--prompt', prompt];
      default:
        return ['--prompt', prompt];
    }
  }
}
