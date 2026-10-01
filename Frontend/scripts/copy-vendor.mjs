import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const nodeModules = path.join(projectRoot, 'node_modules');
const vendorRoot = path.join(projectRoot, 'public', 'vendor');

const vendorPaths = [
  'bootstrap/dist',
  'jsvectormap/dist',
  'apexcharts/dist',
  'choices.js/public/assets/scripts',
  'swiper',
  'simplebar/dist',
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Missing vendor source: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

for (const vendorPath of vendorPaths) {
  copyDir(path.join(nodeModules, vendorPath), path.join(vendorRoot, vendorPath));
}

const tablerCssSrc = fs.existsSync(path.join(nodeModules, '@tabler', 'icons-webfont', 'dist', 'tabler-icons.min.css'))
  ? path.join(nodeModules, '@tabler', 'icons-webfont', 'dist', 'tabler-icons.min.css')
  : path.join(nodeModules, '@tabler', 'icons-webfont', 'tabler-icons.min.css');
const tablerCssDestDir = path.join(vendorRoot, 'tabler-icons');
if (fs.existsSync(tablerCssSrc)) {
  fs.mkdirSync(tablerCssDestDir, { recursive: true });
  fs.copyFileSync(tablerCssSrc, path.join(tablerCssDestDir, 'tabler-icons.min.css'));
  const tablerFontsDir = fs.existsSync(path.join(nodeModules, '@tabler', 'icons-webfont', 'dist', 'fonts'))
    ? path.join(nodeModules, '@tabler', 'icons-webfont', 'dist', 'fonts')
    : path.join(nodeModules, '@tabler', 'icons-webfont', 'fonts');
  if (fs.existsSync(tablerFontsDir)) {
    copyDir(tablerFontsDir, path.join(tablerCssDestDir, 'fonts'));
  }
}

const jsvectormapCss = path.join(nodeModules, 'jsvectormap', 'dist', 'css', 'jsvectormap.min.css');
const jsvectormapCssDestDir = path.join(vendorRoot, 'jsvectormap', 'dist', 'css');
if (fs.existsSync(jsvectormapCss)) {
  fs.mkdirSync(jsvectormapCssDestDir, { recursive: true });
  fs.copyFileSync(jsvectormapCss, path.join(jsvectormapCssDestDir, 'jsvectormap.min.css'));
}

console.log('Vendor assets copied to public/vendor');
