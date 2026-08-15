import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const sourceRoot = 'C:\\Users\\Techno Shield\\Downloads\\Dasher-Dashboard';
const tempRoot = path.join(sourceRoot, '.temp');
const contentDir = path.join(projectRoot, 'src', 'content');
const publicAssets = path.join(projectRoot, 'public', 'assets');

const routeMap = {
  'index.html': { route: '/', title: 'Dasher Free - Responsive Bootstrap 5 Admin Dashboard', layout: 'dashboard', scripts: ['sidebarnav', 'jsvectormap', 'apexcharts', 'chart', 'choices', 'swiper'] },
  'pages/blank.html': { route: '/pages/blank', title: 'Blank | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'dashboard', scripts: ['sidebarnav'] },
  'pages/error/404-error.html': { route: '/pages/error/404-error', title: '404 error | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: [] },
  'pages/error/maintenance.html': { route: '/pages/error/maintenance', title: 'Maintenance | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: [] },
  'pages/authentication/sign-in.html': { route: '/pages/authentication/sign-in', title: 'Sign In | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: ['password'] },
  'pages/authentication/sign-up.html': { route: '/pages/authentication/sign-up', title: 'Sign Up | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: ['password'] },
  'pages/authentication/forget-password.html': { route: '/pages/authentication/forget-password', title: 'Forget Password | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: [] },
  'pages/authentication/reset-password.html': { route: '/pages/authentication/reset-password', title: 'Otp varification | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: ['password'] },
  'pages/authentication/otp-varification.html': { route: '/pages/authentication/otp-varification', title: 'Otp varification | Dasher - Responsive Bootstrap 5 Admin Dashboard', layout: 'standalone', scripts: ['password'] },
};

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1].trim() : html;
}

function extractScripts(bodyHtml) {
  const scripts = [];
  const cleaned = bodyHtml.replace(/<script\b[^>]*src="([^"]+)"[^>]*>\s*<\/script>/gi, (_, src) => {
    scripts.push(src);
    return '';
  }).replace(/<script\b[^>]*>\s*[\s\S]*?<\/script>/gi, '');
  return { html: cleaned.trim(), scripts };
}

function rewritePaths(html) {
  let result = html
    .replace(/\.\/node_modules\//g, '/vendor/')
    .replace(/\.\.\/\.\.\/node_modules\//g, '/vendor/')
    .replace(/\.\.\/node_modules\//g, '/vendor/')
    .replace(/\.\/assets\//g, '/assets/')
    .replace(/\.\.\/\.\.\/assets\//g, '/assets/')
    .replace(/\.\.\/assets\//g, '/assets/')
    .replace(/src="assets\//g, 'src="/assets/')
    .replace(/href="assets\//g, 'href="/assets/');

  const htmlRouteReplacements = [
    [/href="\.\/index\.html"/g, 'href="/" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/index\.html"/g, 'href="/" data-internal-link="true"'],
    [/href="\.\.\/index\.html"/g, 'href="/" data-internal-link="true"'],
    [/href="\.\/pages\/blank\.html"/g, 'href="/pages/blank" data-internal-link="true"'],
    [/href="\.\.\/pages\/blank\.html"/g, 'href="/pages/blank" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/blank\.html"/g, 'href="/pages/blank" data-internal-link="true"'],
    [/href="\.\/pages\/error\/maintenance\.html"/g, 'href="/pages/error/maintenance" data-internal-link="true"'],
    [/href="\.\.\/pages\/error\/maintenance\.html"/g, 'href="/pages/error/maintenance" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/error\/maintenance\.html"/g, 'href="/pages/error/maintenance" data-internal-link="true"'],
    [/href="\.\/pages\/error\/404-error\.html"/g, 'href="/pages/error/404-error" data-internal-link="true"'],
    [/href="\.\.\/pages\/error\/404-error\.html"/g, 'href="/pages/error/404-error" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/error\/404-error\.html"/g, 'href="/pages/error/404-error" data-internal-link="true"'],
    [/href="\.\/pages\/authentication\/sign-in\.html"/g, 'href="/pages/authentication/sign-in" data-internal-link="true"'],
    [/href="\.\.\/pages\/authentication\/sign-in\.html"/g, 'href="/pages/authentication/sign-in" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/authentication\/sign-in\.html"/g, 'href="/pages/authentication/sign-in" data-internal-link="true"'],
    [/href="\.\/pages\/authentication\/sign-up\.html"/g, 'href="/pages/authentication/sign-up" data-internal-link="true"'],
    [/href="\.\.\/pages\/authentication\/sign-up\.html"/g, 'href="/pages/authentication/sign-up" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/authentication\/sign-up\.html"/g, 'href="/pages/authentication/sign-up" data-internal-link="true"'],
    [/href="\.\/pages\/authentication\/forget-password\.html"/g, 'href="/pages/authentication/forget-password" data-internal-link="true"'],
    [/href="\.\.\/pages\/authentication\/forget-password\.html"/g, 'href="/pages/authentication/forget-password" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/authentication\/forget-password\.html"/g, 'href="/pages/authentication/forget-password" data-internal-link="true"'],
    [/href="\.\/pages\/authentication\/reset-password\.html"/g, 'href="/pages/authentication/reset-password" data-internal-link="true"'],
    [/href="\.\.\/pages\/authentication\/reset-password\.html"/g, 'href="/pages/authentication/reset-password" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/authentication\/reset-password\.html"/g, 'href="/pages/authentication/reset-password" data-internal-link="true"'],
    [/href="\.\/pages\/authentication\/otp-varification\.html"/g, 'href="/pages/authentication/otp-varification" data-internal-link="true"'],
    [/href="\.\.\/pages\/authentication\/otp-varification\.html"/g, 'href="/pages/authentication/otp-varification" data-internal-link="true"'],
    [/href="\.\.\/\.\.\/pages\/authentication\/otp-varification\.html"/g, 'href="/pages/authentication/otp-varification" data-internal-link="true"'],
    [/href="sign-in\.html"/g, 'href="/pages/authentication/sign-in" data-internal-link="true"'],
    [/href="sign-up\.html"/g, 'href="/pages/authentication/sign-up" data-internal-link="true"'],
    [/href="forget-password\.html"/g, 'href="/pages/authentication/forget-password" data-internal-link="true"'],
    [/href="reset-password\.html"/g, 'href="/pages/authentication/reset-password" data-internal-link="true"'],
    [/href="otp-varification\.html"/g, 'href="/pages/authentication/otp-varification" data-internal-link="true"'],
    [/href="\.\/sign-in\.html"/g, 'href="/pages/authentication/sign-in" data-internal-link="true"'],
  ];

  for (const [pattern, replacement] of htmlRouteReplacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

function toComponentName(relativePath) {
  return relativePath
    .replace(/\.html$/, '')
    .split(/[\\/]/)
    .map((part) => part.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase()))
    .join('');
}

fs.mkdirSync(contentDir, { recursive: true });
copyDir(path.join(sourceRoot, 'src', 'assets'), publicAssets);

const pagesMeta = [];

for (const [relativePath, meta] of Object.entries(routeMap)) {
  const sourceHtmlPath = path.join(tempRoot, relativePath);
  const rawHtml = fs.readFileSync(sourceHtmlPath, 'utf8');
  const body = extractBody(rawHtml);
  const { html, scripts } = extractScripts(body);
  const processedHtml = rewritePaths(html);

  const contentFile = relativePath.replace(/\.html$/, '.html');
  const contentPath = path.join(contentDir, contentFile);
  fs.mkdirSync(path.dirname(contentPath), { recursive: true });
  fs.writeFileSync(contentPath, processedHtml, 'utf8');

  pagesMeta.push({
    ...meta,
    relativePath,
    contentImport: `./content/${contentFile.replace(/\\/g, '/')}`,
    componentName: toComponentName(relativePath),
    externalScripts: scripts.map((src) =>
      src
        .replace(/^\.\/node_modules\//, '/vendor/')
        .replace(/^\.\.\/\.\.\/node_modules\//, '/vendor/')
        .replace(/^\.\/assets\//, '/assets/')
        .replace(/^\.\.\/\.\.\/assets\//, '/assets/')
    ),
  });
}

fs.writeFileSync(
  path.join(projectRoot, 'src', 'routes.json'),
  JSON.stringify(pagesMeta, null, 2),
  'utf8'
);

const copyTargets = [
  ['LICENSE', 'LICENSE'],
  ['.gitignore', '.gitignore'],
  ['gulpfile.js', 'gulpfile.js'],
  ['package-lock.json', 'original-package-lock.json'],
  ['src/assets/scss', 'src/assets/scss'],
  ['src/partials', 'src/original/partials'],
  ['src/pages', 'src/original/pages'],
  ['src/index.html', 'src/original/index.html'],
  ['.github', '.github'],
];

for (const [from, to] of copyTargets) {
  const srcPath = path.join(sourceRoot, from);
  const destPath = path.join(projectRoot, to);
  if (!fs.existsSync(srcPath)) continue;
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) copyDir(srcPath, destPath);
  else {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

const readme = `# Dasher UI - Bootstrap 5 Admin Dashboard (React)

React conversion of the Dasher Bootstrap 5 admin dashboard template.

## Getting Started

1. Install dependencies

\`\`\`bash
npm install
\`\`\`

2. Run the development server

\`\`\`bash
npm run dev
\`\`\`

3. Build for production

\`\`\`bash
npm run build
\`\`\`

## Notes

- Original HTML source files are preserved under \`src/original/\`.
- Theme assets live under \`public/assets/\`.
- Page markup is preserved under \`src/content/\` and rendered through React Router.

## Author

Design and code is completely written by CodesCandy and development team.

## License

Design and Code is Copyright © [CodesCandy](https://codescandy.com/)
Licensed under MIT
Distributed by [ThemeWagon](https://themewagon.com)
`;

fs.writeFileSync(path.join(projectRoot, 'README.md'), readme, 'utf8');

console.log(`Copied assets and generated ${pagesMeta.length} page content files.`);
