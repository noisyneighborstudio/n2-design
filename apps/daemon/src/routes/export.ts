import { Router, Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import { promises as fs } from 'fs';

export function createExportRoutes(exportService: ExportService): Router {
  const router = Router();

  // Export project to ZIP
  router.post('/:projectId', async (req: Request, res: Response) => {
    try {
      const result = await exportService.exportProject(req.params.projectId);
      
      // Stream the ZIP file
      const zipBuffer = await fs.readFile(result.zipPath);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=export.zip');
      res.send(zipBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
