import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectService } from '../services/project.service';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `n2-test-${Date.now()}`);
    projectService = new ProjectService(testDir);
    await projectService.initialize();
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('createProject', () => {
    it('should create a project with name', async () => {
      const project = await projectService.createProject('Test Project');
      
      expect(project).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.id).toBeTruthy();
      expect(project.path).toBeTruthy();
    });

    it('should create a project with description', async () => {
      const project = await projectService.createProject(
        'Test Project',
        'A test description'
      );
      
      expect(project.description).toBe('A test description');
    });

    it('should create project directory structure', async () => {
      const project = await projectService.createProject('Test');
      
      const projectExists = await fs.access(project.path).then(() => true).catch(() => false);
      const srcExists = await fs.access(path.join(project.path, 'src')).then(() => true).catch(() => false);
      const designExists = await fs.access(path.join(project.path, 'DESIGN.md')).then(() => true).catch(() => false);
      
      expect(projectExists).toBe(true);
      expect(srcExists).toBe(true);
      expect(designExists).toBe(true);
    });
  });

  describe('getProject', () => {
    it('should retrieve created project', async () => {
      const created = await projectService.createProject('Test');
      const retrieved = await projectService.getProject(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(created.name);
    });

    it('should return undefined for non-existent project', async () => {
      const result = await projectService.getProject('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('listProjects', () => {
    it('should list all projects', async () => {
      await projectService.createProject('Project 1');
      await projectService.createProject('Project 2');
      
      const projects = await projectService.listProjects();
      expect(projects.length).toBe(2);
    });

    it('should return empty array when no projects exist', async () => {
      const projects = await projectService.listProjects();
      expect(projects).toEqual([]);
    });
  });

  describe('deleteProject', () => {
    it('should delete existing project', async () => {
      const project = await projectService.createProject('Test');
      const deleted = await projectService.deleteProject(project.id);
      
      expect(deleted).toBe(true);
      
      const exists = await fs.access(project.path).then(() => true).catch(() => false);
      expect(exists).toBe(false);
    });

    it('should return false for non-existent project', async () => {
      const deleted = await projectService.deleteProject('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('file operations', () => {
    it('should write and read files', async () => {
      const project = await projectService.createProject('Test');
      const content = 'Hello, world!';
      
      await projectService.writeFile(project.id, 'test.txt', content);
      const read = await projectService.readFile(project.id, 'test.txt');
      
      expect(read).toBe(content);
    });

    it('should list project files', async () => {
      const project = await projectService.createProject('Test');
      
      await projectService.writeFile(project.id, 'src/index.html', '<html></html>');
      await projectService.writeFile(project.id, 'src/style.css', 'body {}');
      
      const files = await projectService.getProjectFiles(project.id);
      
      expect(files).toContain('src/index.html');
      expect(files).toContain('src/style.css');
      expect(files).toContain('DESIGN.md');
      expect(files).toContain('project.json');
    });
  });
});
