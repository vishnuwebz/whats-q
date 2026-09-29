import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const buildOutputDir = path.resolve('build_output');

if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, buildOutputDir, { recursive: true });
  const distAssetsPath = path.join(distDir, 'assets');
  const buildAssetsPath = path.join(buildOutputDir, 'assets');
  if (fs.existsSync(distAssetsPath) && fs.existsSync(buildAssetsPath)) {
    const distAssets = new Set(fs.readdirSync(distAssetsPath));
    const buildAssets = fs.readdirSync(buildAssetsPath);
    for (const file of buildAssets) {
      if (!distAssets.has(file)) {
        fs.unlinkSync(path.join(buildAssetsPath, file));
      }
    }
  }
  console.log('✓ Successfully synced dist to build_output for production deployment');
}
