import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import { promises as fs } from 'fs';

export class ScreenshotService {
  private browser?: Browser;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async captureProjectScreenshots(projectPath: string): Promise<string[]> {
    if (!this.browser) {
      throw new Error('Screenshot service not initialized');
    }

    const screenshots: string[] = [];
    const screenshotsDir = path.join(projectPath, 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });

    // Look for HTML files in src directory
    const srcDir = path.join(projectPath, 'src');
    const htmlFiles = await this.findHtmlFiles(srcDir);

    for (const htmlFile of htmlFiles) {
      const page = await this.browser.newPage();
      try {
        const fileUrl = `file://${htmlFile}`;
        await page.goto(fileUrl, { waitUntil: 'networkidle' });
        
        const fileName = path.basename(htmlFile, '.html');
        const screenshotPath = path.join(screenshotsDir, `${fileName}.png`);
        
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        
        screenshots.push(screenshotPath);
      } catch (err) {
        console.error(`Failed to capture screenshot for ${htmlFile}:`, err);
      } finally {
        await page.close();
      }
    }

    return screenshots;
  }

  async captureUrl(url: string, outputPath: string): Promise<void> {
    if (!this.browser) {
      throw new Error('Screenshot service not initialized');
    }

    const page = await this.browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: outputPath, fullPage: true });
    } finally {
      await page.close();
    }
  }

  private async findHtmlFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subFiles = await this.findHtmlFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.html')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    return files;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}
