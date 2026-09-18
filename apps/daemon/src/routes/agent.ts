import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CLIAdapterService } from '../cli-adapters';
import { ProjectService } from '../services/project.service';

export function createAgentRoutes(
  cliService: CLIAdapterService,
  projectService: ProjectService
): Router {
  const router = Router();

  // Execute agent task with SSE streaming
  router.post('/:projectId/execute', async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { prompt, adapter } = req.body;

    if (!prompt || !adapter) {
      return res.status(400).json({ error: 'prompt and adapter are required' });
    }

    const project = await projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const taskId = uuidv4();

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent('start', { taskId, projectId, adapter });

    const onOutput = (data: string) => {
      sendEvent('output', { data });
    };

    const onError = (data: string) => {
      sendEvent('error', { data });
    };

    try {
      const result = await cliService.executeCommand(
        adapter,
        project.path,
        prompt,
        onOutput,
        onError
      );

      if (result.success) {
        sendEvent('complete', { taskId, success: true });
      } else {
        sendEvent('complete', { taskId, success: false, error: result.error });
      }
    } catch (error: any) {
      sendEvent('complete', { taskId, success: false, error: error.message });
    }

    res.end();
  });

  return router;
}
