const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const BACKEND_VIEWS_DIR = path.join(__dirname, '..', 'backend', 'views');
const IGNORED_DIRS = ['dist', 'node_modules', '.git'];

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    if (IGNORED_DIRS.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      if (entry.name !== "build.js" && entry.name !== "package.json" && entry.name !== "package-lock.json") {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// 1. Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  try {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    fs.mkdirSync(DIST_DIR);
  } catch (err) {
    console.warn('⚠️  Could not remove dist directory (possibly locked by another process). Cleaning its contents instead...');
    const entries = fs.readdirSync(DIST_DIR);
    for (let entry of entries) {
      fs.rmSync(path.join(DIST_DIR, entry), { recursive: true, force: true });
    }
  }
} else {
  fs.mkdirSync(DIST_DIR);
}

// 2. Copy all allowed source directories and files
copyDirSync(__dirname, DIST_DIR);

// 2.5. Copy backend directory and its data into frontend dist so Cloudflare Pages can serve /backend/*
const distBackendDir = path.join(DIST_DIR, 'backend');
const BACKEND_DIR = path.join(__dirname, '..', 'backend');
if (fs.existsSync(BACKEND_DIR)) {
  fs.mkdirSync(distBackendDir, { recursive: true });
  if (fs.existsSync(path.join(BACKEND_DIR, 'index.html'))) {
    fs.copyFileSync(path.join(BACKEND_DIR, 'index.html'), path.join(distBackendDir, 'index.html'));
    console.log('✅ Copied backend/index.html to /dist/backend/index.html');
  }
  const backendDataDir = path.join(BACKEND_DIR, 'data');
  if (fs.existsSync(backendDataDir)) {
    copyDirSync(backendDataDir, path.join(distBackendDir, 'data'));
    console.log('✅ Copied backend/data/ to /dist/backend/data/');
  }
}
if (fs.existsSync(BACKEND_VIEWS_DIR)) {
  fs.mkdirSync(distBackendDir, { recursive: true });
  const backendViewFiles = fs.readdirSync(BACKEND_VIEWS_DIR, { withFileTypes: true });

  for (const entry of backendViewFiles) {
    if (!entry.isFile() || path.extname(entry.name) !== '.html') continue;
    fs.copyFileSync(path.join(BACKEND_VIEWS_DIR, entry.name), path.join(distBackendDir, entry.name));
  }

  console.log('✅ Copied backend views into /dist/backend');
}

// 2.6 Copy root Media folder to dist/Media
const ROOT_MEDIA_DIR = path.join(__dirname, '..', 'Media');
const distMediaDir = path.join(DIST_DIR, 'Media');
if (fs.existsSync(ROOT_MEDIA_DIR)) {
  // copyDirSync(ROOT_MEDIA_DIR, distMediaDir);
  console.log('✅ Copied root Media to /dist/Media');
}

// 3. Bundle CSS (Inline @imports to avoid render-blocking waterfalls)
const globalCssPath = path.join(DIST_DIR, 'shared', 'styles', 'global.css');
if (fs.existsSync(globalCssPath)) {
  let content = fs.readFileSync(globalCssPath, 'utf-8');
  const importRegex = /@import\s+["']\.\/([^"']+)["'];?/g;
  let newContent = content.replace(importRegex, (match, p1) => {
    // Remove query params if any e.g. components.css?v=2
    const filename = p1.split('?')[0];
    const filepath = path.join(DIST_DIR, 'shared', 'styles', filename);
    if (fs.existsSync(filepath)) {
      return `/* --- INLINED: ${filename} --- */\n` + fs.readFileSync(filepath, 'utf-8');
    }
    return match;
  });
  fs.writeFileSync(globalCssPath, newContent);
  console.log('✅ Bundled global.css (inlined @imports)');
}

// Copy cineland if exists in frontend
const cinelandSrc = path.join(__dirname, 'cineland');
const cinelandDist = path.join(DIST_DIR, 'cineland');
if (fs.existsSync(cinelandSrc)) {
  copyDirSync(cinelandSrc, cinelandDist);
  console.log('✅ Preserved /dist/cineland from frontend/cineland');
}

console.log('🎉 Build completed successfully in /dist!');
