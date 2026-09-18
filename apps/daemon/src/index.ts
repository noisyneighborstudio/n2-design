import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ProjectService } from './services/project.service';
import { ScreenshotService } from './services/screenshot.service';
import { ExportService } from './services/export.service';
import { CLIAdapterService } from './cli-adapters';
import { createProjectRoutes } from './routes/projects';
import { createCLIRoutes } from './routes/cli';
import { createAgentRoutes } from './routes/agent';
import { createExportRoutes } from './routes/export';

const PORT = process.env.PORT || 3001;

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize services
  const projectService = new ProjectService('./projects');
  await projectService.initialize();

  const screenshotService = new ScreenshotService();
  await screenshotService.initialize();

  const exportService = new ExportService(projectService, screenshotService);
  const cliService = new CLIAdapterService();

  // Detect available CLIs on startup
  const adapters = await cliService.detectAvailableCLIs();
  console.log('\n🔧 Available CLI Adapters:');
  adapters.forEach(adapter => {
    const status = adapter.available ? '✓' : '✗';
    const version = adapter.version ? ` (${adapter.version})` : '';
    console.log(`  ${status} ${adapter.name}${version}`);
  });
  console.log('');

  // Routes
  app.use('/api/projects', createProjectRoutes(projectService));
  app.use('/api/cli', createCLIRoutes(cliService));
  app.use('/api/agent', createAgentRoutes(cliService, projectService));
  app.use('/api/export', createExportRoutes(exportService));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down daemon...');
    await screenshotService.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 N2 Design daemon running on http://localhost:${PORT}`);
    console.log(`📁 Projects directory: ${projectService['projectsDir']}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start daemon:', err);
  process.exit(1);
});
