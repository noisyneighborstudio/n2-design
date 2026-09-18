import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../types';

export class ProjectService {
  private projectsDir: string;
  private projects: Map<string, Project> = new Map();

  constructor(baseDir: string = './projects') {
    this.projectsDir = path.resolve(baseDir);
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.projectsDir, { recursive: true });
    await this.loadProjects();
  }

  private async loadProjects(): Promise<void> {
    try {
      const entries = await fs.readdir(this.projectsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const metaPath = path.join(this.projectsDir, entry.name, 'project.json');
          try {
            const content = await fs.readFile(metaPath, 'utf-8');
            const project: Project = JSON.parse(content);
            this.projects.set(project.id, project);
          } catch {
            // Skip invalid project directories
          }
        }
      }
    } catch {
      // Projects directory doesn't exist yet
    }
  }

  async createProject(name: string, description?: string): Promise<Project> {
    const id = uuidv4();
    const projectPath = path.join(this.projectsDir, id);
    
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
    
    const project: Project = {
      id,
      name,
      description,
      path: projectPath,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await fs.writeFile(
      path.join(projectPath, 'project.json'),
      JSON.stringify(project, null, 2)
    );

    // Create initial DESIGN.md from template
    const designMd = await this.getDefaultDesignMd();
    await fs.writeFile(
      path.join(projectPath, 'DESIGN.md'),
      designMd
    );

    this.projects.set(id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async deleteProject(id: string): Promise<boolean> {
    const project = this.projects.get(id);
    if (!project) return false;

    await fs.rm(project.path, { recursive: true, force: true });
    this.projects.delete(id);
    return true;
  }

  async getProjectFiles(id: string): Promise<string[]> {
    const project = this.projects.get(id);
    if (!project) return [];

    const files: string[] = [];
    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          const relativePath = path.relative(project.path, fullPath);
          files.push(relativePath);
        }
      }
    };

    await walk(project.path);
    return files;
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const fullPath = path.join(project.path, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const fullPath = path.join(project.path, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }

  private async getDefaultDesignMd(): Promise<string> {
    // This will be populated from a template file later
    return `# Design System

## Brand
- Studio: Noisy Neighbor Studio
- Aesthetic: Modern, clean, functional
- Avoid: Generic AI slop, over-engineered patterns

## Typography
- Headings: System font stack (San Francisco, Segoe UI, Roboto)
- Body: System font stack
- Code: Monospace (SF Mono, Consolas, Monaco)

## Color Palette
- Primary: #0066FF
- Background: #FFFFFF
- Surface: #F5F5F5
- Text: #1A1A1A
- Text Secondary: #666666
- Border: #E0E0E0

## Layout
- Max content width: 1200px
- Grid: 12 columns
- Spacing scale: 4px base (4, 8, 16, 24, 32, 48, 64)
- Border radius: 8px

## Components
- Buttons: Rounded corners, clear hover states
- Cards: Subtle shadows, defined borders
- Forms: Clear labels, inline validation
- Navigation: Simple, uncluttered

## Interaction
- Animations: Subtle, purposeful (200-300ms)
- Feedback: Immediate, clear
- Loading states: Skeleton screens preferred
- Error states: Helpful, actionable messages
`;
  }
}
