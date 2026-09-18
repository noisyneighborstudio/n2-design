import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/project.service';

export function createProjectRoutes(projectService: ProjectService): Router {
  const router = Router();

  // List all projects
  router.get('/', async (req: Request, res: Response) => {
    try {
      const projects = await projectService.listProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new project
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      const project = await projectService.createProject(name, description);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get project by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const project = await projectService.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete project
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const success = await projectService.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List project files
  router.get('/:id/files', async (req: Request, res: Response) => {
    try {
      const files = await projectService.getProjectFiles(req.params.id);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Read file
  router.get('/:id/files/*', async (req: Request, res: Response) => {
    try {
      const filePath = req.params[0];
      const content = await projectService.readFile(req.params.id, filePath);
      res.type('text/plain').send(content);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Write file
  router.put('/:id/files/*', async (req: Request, res: Response) => {
    try {
      const filePath = req.params[0];
      const { content } = req.body;
      await projectService.writeFile(req.params.id, filePath, content);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
