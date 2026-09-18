import { Router, Request, Response } from 'express';
import { CLIAdapterService } from '../cli-adapters';

export function createCLIRoutes(cliService: CLIAdapterService): Router {
  const router = Router();

  // List available CLI adapters
  router.get('/', async (req: Request, res: Response) => {
    try {
      const adapters = await cliService.detectAvailableCLIs();
      res.json(adapters);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
