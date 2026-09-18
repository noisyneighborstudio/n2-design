import archiver from 'archiver';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import { ProjectService } from './project.service';
import { ScreenshotService } from './screenshot.service';
import { ExportResult } from '../types';

export class ExportService {
  constructor(
    private projectService: ProjectService,
    private screenshotService: ScreenshotService
  ) {}

  async exportProject(projectId: string): Promise<ExportResult> {
    const project = await this.projectService.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Capture screenshots
    const screenshotPaths = await this.screenshotService.captureProjectScreenshots(project.path);

    // Create ZIP
    const zipPath = path.join(project.path, `${project.name}-export.zip`);
    await this.createZip(project.path, zipPath);

    return { zipPath, screenshotPaths };
  }

  private async createZip(projectPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // Add source files
      archive.directory(path.join(projectPath, 'src'), 'src');
      
      // Add DESIGN.md
      const designPath = path.join(projectPath, 'DESIGN.md');
      fs.access(designPath)
        .then(() => archive.file(designPath, { name: 'DESIGN.md' }))
        .catch(() => {});

      // Add screenshots
      const screenshotsDir = path.join(projectPath, 'screenshots');
      fs.access(screenshotsDir)
        .then(() => archive.directory(screenshotsDir, 'screenshots'))
        .catch(() => {})
        .finally(() => archive.finalize());
    });
  }
}
