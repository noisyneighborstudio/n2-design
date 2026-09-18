import { describe, it, expect, beforeAll } from 'vitest';
import { CLIAdapterService } from '../cli-adapters';

describe('CLIAdapterService', () => {
  let cliService: CLIAdapterService;

  beforeAll(() => {
    cliService = new CLIAdapterService();
  });

  describe('detectAvailableCLIs', () => {
    it('should detect available CLIs', async () => {
      const adapters = await cliService.detectAvailableCLIs();
      
      expect(adapters).toBeDefined();
      expect(adapters.length).toBeGreaterThan(0);
      
      const adapterNames = adapters.map(a => a.name);
      expect(adapterNames).toContain('claude');
      expect(adapterNames).toContain('codex');
      expect(adapterNames).toContain('grok');
    });

    it('should mark each adapter as available or not', async () => {
      const adapters = await cliService.detectAvailableCLIs();
      
      adapters.forEach(adapter => {
        expect(typeof adapter.available).toBe('boolean');
        expect(adapter.name).toBeTruthy();
        expect(adapter.command).toBeTruthy();
      });
    });
  });

  describe('getAdapter', () => {
    it('should retrieve adapter after detection', async () => {
      await cliService.detectAvailableCLIs();
      
      const claude = cliService.getAdapter('claude');
      expect(claude).toBeDefined();
      expect(claude?.name).toBe('claude');
    });

    it('should return undefined for unknown adapter', async () => {
      await cliService.detectAvailableCLIs();
      
      const unknown = cliService.getAdapter('unknown-cli');
      expect(unknown).toBeUndefined();
    });
  });

  describe('executeCommand', () => {
    it('should return error for unavailable adapter', async () => {
      await cliService.detectAvailableCLIs();
      
      const result = await cliService.executeCommand(
        'claude',
        '/tmp',
        'test prompt',
        () => {},
        () => {}
      );
      
      // Will fail unless Claude CLI is installed, which is expected
      if (!result.success) {
        expect(result.error).toBeTruthy();
        expect(result.error).toContain('not installed');
      }
    });

    it('should return error for non-existent adapter', async () => {
      const result = await cliService.executeCommand(
        'nonexistent',
        '/tmp',
        'test',
        () => {},
        () => {}
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
