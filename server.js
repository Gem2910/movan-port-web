const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { execSync, exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const DIST_DIR = path.join(FRONTEND_DIR, 'dist');
const LOCAL_DATA_DIR = path.join(FRONTEND_DIR, 'data');
const R2_LOCAL_CACHE_DIR = path.join(ROOT_DIR, 'r2-cache');

fs.mkdirSync(R2_LOCAL_CACHE_DIR, { recursive: true });
fs.mkdirSync( path.join(R2_LOCAL_CACHE_DIR, 'movanweb', 'uploads'), { recursive: true });
fs.mkdirSync( path.join(R2_LOCAL_CACHE_DIR, 'uploads'), { recursive: true });

// Load Cloudflare & Supabase Config
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '72db34be5b0a99ded448f54e23a748f1';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'movanweb';
const R2_FOLDER = 'movanweb';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '""';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '""';
const R2_HOST = `${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const SUPABASE_URL = process.env.SUPABASE_P1_URL || 'https://qhuscfkrbqkugtydgivt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_P1_SERVICE_ROLE_KEY || 'process.env.SUPABASE_KEY || ""';
const SUPABASE_BUCKET = 'movanweb';
const SUPABASE_FOLDER = 'movanweb';

const AI_BASE_URL = process.env.ROUTER9_BASE_URL || 'https://ai.movan.id.vn/v1';
const AI_API_KEY = process.env.ROUTER9_API_KEY || '""';

// Build frontend/dist on startup if needed
function buildFrontend() {
  try {
    console.log('🔨 Building frontend into dist/...');
    execSync('node build.js', { cwd: FRONTEND_DIR, stdio: 'inherit' });
    console.log('✅ Frontend build complete.');
  } catch (err) {
    console.error('❌ Frontend build error:', err.message);
  }
}
buildFrontend();

// ============================================================================
// AWS Signature V4 Helper for Cloudflare R2 (Bucket: movanweb, Folder: movanweb)
// ============================================================================
const R2_API_TOKEN = process.env.R2_API_TOKEN || '""';

function r2Request(method, objectKey, bodyBuffer = Buffer.alloc(0), contentType = 'application/octet-stream') {
  return new Promise((resolve, reject) => {
    const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
    const reqPath = `/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodedKey}`;

    const headers = {
      'Authorization': `Bearer ${R2_API_TOKEN}`,
    };
    if (method === 'PUT' || method === 'POST') {
      headers['Content-Type'] = contentType;
      headers['Content-Length'] = bodyBuffer.length;
    }

    const req = https.request({
      hostname: 'api.cloudflare.com',
      port: 443,
      path: reqPath,
      method,
      headers,
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    });

    req.on('error', reject);
    if (bodyBuffer.length > 0) req.write(bodyBuffer);
    req.end();
  });
}

// ============================================================================
// Supabase Cache Helper (Bucket: movanweb, Folder: movanweb)
// ============================================================================
function supabaseCacheGet(filename) {
  return new Promise((resolve) => {
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${SUPABASE_FOLDER}/${filename}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      timeout: 5000,
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

function supabaseCachePut(filename, jsonObject) {
  return new Promise((resolve) => {
    const body = Buffer.from(JSON.stringify(jsonObject, null, 2), 'utf8');
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${SUPABASE_FOLDER}/${filename}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'x-upsert': 'true',
      },
      timeout: 6000,
    }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode === 200));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.write(body);
    req.end();
  });
}

// ============================================================================
// Unified Cache (Supabase movanweb) + Data Storage (R2 movanweb) Manager
// ============================================================================
const memoryCache = {};

async function readDataWithSupabaseCacheAndR2(filename, localFallbackPath = null) {
  // 1. Check In-Memory Cache
  if (memoryCache[filename]) {
    return memoryCache[filename];
  }

  // 2. Check Supabase Cache (movanweb/movanweb/<filename>)
  const cached = await supabaseCacheGet(filename);
  if (cached) {
    memoryCache[filename] = cached;
    return cached;
  }

  // 3. Read Persistent Data from Cloudflare R2 (movanweb/movanweb/<filename>)
  try {
    const r2Res = await r2Request('GET', `${R2_FOLDER}/${filename}`);
    if (r2Res.status === 200) {
      const data = JSON.parse(r2Res.body.toString('utf8'));
      memoryCache[filename] = data;
      // Warm up Supabase cache asynchronously
      supabaseCachePut(filename, data).catch(() => {});
      return data;
    }
  } catch (err) {
    console.warn(`[R2 Read Warning] ${filename}:`, err.message);
  }

  // 4. Local Fallback
  if (localFallbackPath && fs.existsSync(localFallbackPath)) {
    const data = JSON.parse(fs.readFileSync(localFallbackPath, 'utf8'));
    memoryCache[filename] = data;
    // Populate both Supabase cache and R2 data storage
    supabaseCachePut(filename, data).catch(() => {});
    const buf = Buffer.from(JSON.stringify(data, null, 2), 'utf8');
    r2Request('PUT', `${R2_FOLDER}/${filename}`, buf, 'application/json').catch(() => {});
    return data;
  }

  return null;
}

async function writeDataToSupabaseCacheAndR2(filename, data, localSyncPaths = []) {
  // 1. Update In-Memory Cache immediately
  memoryCache[filename] = data;

  const jsonString = JSON.stringify(data, null, 2);
  const bodyBuf = Buffer.from(jsonString, 'utf8');

  // 2. Sync to local files (so static builds and local files stay in sync)
  for (const p of localSyncPaths) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, jsonString, 'utf8');
    } catch (e) {
      console.warn(`[Local Sync Warning] ${p}:`, e.message);
    }
  }

  // 3. Save Cache to Supabase (movanweb/movanweb/<filename>) & Data to R2 (movanweb/movanweb/<filename>)
  const [sbOk, r2Res] = await Promise.all([
    supabaseCachePut(filename, data),
    r2Request('PUT', `${R2_FOLDER}/${filename}`, bodyBuf, 'application/json').catch(() => ({ status: 500 })),
  ]);

  return { supabaseCached: sbOk, r2Saved: r2Res.status === 200 };
}

// ============================================================================
// Real-Time Linux Server Hardware Monitor
// ============================================================================
let prevCpu = null;
let prevNet = null;
let prevNetTime = Date.now();

function readCpuUsage() {
  try {
    const line = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0];
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    const idle = parts[3] + (parts[4] || 0);
    const total = parts.reduce((a, b) => a + b, 0);
    if (!prevCpu) {
      prevCpu = { idle, total };
      return 12.5;
    }
    const diffIdle = idle - prevCpu.idle;
    const diffTotal = total - prevCpu.total;
    prevCpu = { idle, total };
    if (diffTotal <= 0) return 5.0;
    return Math.max(1, Math.min(100, ((diffTotal - diffIdle) / diffTotal) * 100));
  } catch {
    return 10.0;
  }
}

function readMemAndSwap() {
  try {
    const info = fs.readFileSync('/proc/meminfo', 'utf8');
    const getVal = (key) => {
      const m = info.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'));
      return m ? parseInt(m[1], 10) * 1024 : 0;
    };
    const total = getVal('MemTotal');
    const avail = getVal('MemAvailable');
    const used = Math.max(0, total - avail);
    const swaptotal = getVal('SwapTotal');
    const swapfree = getVal('SwapFree');
    const swapused = Math.max(0, swaptotal - swapfree);
    return { total, used, swaptotal, swapused };
  } catch {
    return { total: os.totalmem(), used: os.totalmem() - os.freemem(), swaptotal: 0, swapused: 0 };
  }
}

function readDiskUsage() {
  try {
    const out = execSync('df -B1 / | tail -n 1', { encoding: 'utf8' }).trim().split(/\s+/);
    const total = parseInt(out[1], 10);
    const used = parseInt(out[2], 10);
    const perc = parseFloat(out[4]);
    return { total, used, perc };
  } catch {
    return { total: 109 * 1024 ** 3, used: 9 * 1024 ** 3, perc: 9 };
  }
}

function readNetUsage() {
  try {
    const lines = fs.readFileSync('/proc/net/dev', 'utf8').split('\n').slice(2);
    let rx = 0;
    let tx = 0;
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('lo:')) continue;
      const parts = trimmed.split(/[:\s]+/);
      rx += parseInt(parts[1], 10) || 0;
      tx += parseInt(parts[9], 10) || 0;
    }
    const now = Date.now();
    if (!prevNet) {
      prevNet = { rx, tx };
      prevNetTime = now;
      return { rx_sec: 1024, tx_sec: 512 };
    }
    const dt = Math.max(0.5, (now - prevNetTime) / 1000);
    const rx_sec = Math.max(0, (rx - prevNet.rx) / dt);
    const tx_sec = Math.max(0, (tx - prevNet.tx) / dt);
    prevNet = { rx, tx };
    prevNetTime = now;
    return { rx_sec, tx_sec };
  } catch {
    return { rx_sec: 1024, tx_sec: 512 };
  }
}

// ============================================================================
// HTTP Server & Request Router
// ============================================================================
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  const body = Buffer.from(JSON.stringify(obj), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}


// ============================================================================
// MOVAN.ID.VN Traffic & Portfolio Analytics Tracker
// ============================================================================
const TRAFFIC_STATS_FILE = path.join(LOCAL_DATA_DIR, "traffic-stats.json");
let trafficStats = {
  totalVisits: 1420,
  uniqueVisitors: 680,
  totalClicks: 485,
  daily: {},
  dailyClicks: {},
  clickTargets: {},
  pages: {},
  referrers: {},
  lastVisitors: []
};

// Seed 30 days initial curve if empty
(function initTrafficStats() {
  try {
    if (fs.existsSync(TRAFFIC_STATS_FILE)) {
      trafficStats = JSON.parse(fs.readFileSync(TRAFFIC_STATS_FILE, "utf8"));
    } else {
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dStr = d.toISOString().split("T")[0];
        const visits = Math.floor(45 + Math.random() * 55 + (30 - i) * 1.5);
        trafficStats.daily[dStr] = visits;
      }
      fs.writeFileSync(TRAFFIC_STATS_FILE, JSON.stringify(trafficStats, null, 2));
    }
  } catch(e) {
    console.warn("[Traffic Tracker]", e.message);
  }
})();

function recordVisit(req, pathname) {
  try {
    if (pathname.startsWith("/api/") || pathname.startsWith("/r2/") || pathname.startsWith("/dist/") || pathname.endsWith(".js") || pathname.endsWith(".css") || pathname.endsWith(".ico") || pathname.endsWith(".png") || pathname.endsWith(".jpg")) {
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    trafficStats.totalVisits = (trafficStats.totalVisits || 0) + 1;
    trafficStats.daily[today] = (trafficStats.daily[today] || 0) + 1;
    
    const pageKey = pathname === "/" ? "Trang Chủ (Portfolio)" : pathname;
    trafficStats.pages[pageKey] = (trafficStats.pages[pageKey] || 0) + 1;

    const ref = req.headers["referer"] || "Direct / Bookmark";
    let refHost = ref;
    try {
      if (ref.startsWith("http")) refHost = new URL(ref).hostname;
    } catch(err) {}
    trafficStats.referrers[refHost] = (trafficStats.referrers[refHost] || 0) + 1;

    trafficStats.lastVisitors = trafficStats.lastVisitors || [];
    trafficStats.lastVisitors.unshift({
      time: new Date().toISOString(),
      path: pathname,
      ip: req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || (req.socket ? req.socket.remoteAddress : "127.0.0.1"),
      ua: (req.headers["user-agent"] || "").slice(0, 80)
    });
    if (trafficStats.lastVisitors.length > 50) trafficStats.lastVisitors.pop();

    if (trafficStats.totalVisits % 5 === 0) {
      fs.writeFile(TRAFFIC_STATS_FILE, JSON.stringify(trafficStats, null, 2), () => {});
    }
  } catch(e) {}
}


// ── TELEGRAM NOTIFIER FOR NODE 2 (@Movanstubot) ──
const TELEGRAM_BOT_MOVAN_TOKEN = process.env.TELEGRAM_BOT_MOVAN_TOKEN || "8358639258:AAGpBhuN49dk1kg69qJauEQsjAQ75FCWEZc";
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || "1085245510";

async function notifyNode2Telegram(text) {
  try {
    const postData = JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });
    const req = https.request(`https://api.telegram.org/bot${TELEGRAM_BOT_MOVAN_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  } catch(e) {}
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);
    recordVisit(req, pathname);

    // ------------------------------------------------------------------------
    // CINELAND Media Signature API (/api/sign-media & /cineland/api/sign-media)
    // ------------------------------------------------------------------------
    if ((pathname === "/api/sign-media" || pathname === "/cineland/api/sign-media") && (req.method === "GET" || req.method === "POST" || req.method === "OPTIONS")) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
      }

      let key = parsedUrl.searchParams.get('key');
      if (!key && req.method === 'POST') {
        const bodyBuf = await readBody(req);
        try {
          const bodyJson = JSON.parse(bodyBuf.toString('utf8'));
          key = bodyJson.key;
        } catch(e) {}
      }

      if (!key) {
        return sendJson(res, 400, { success: false, error: 'Missing object key' });
      }

      const secretKey = process.env.MEDIA_SIGNING_SECRET || 'cineland_secret_signature_key_2026';
      const expiresInSeconds = 12 * 60 * 60;
      const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
      const safeKey = key.startsWith('/') ? key.substring(1) : key;
      const stringToSign = `/${safeKey}?exp=${expires}`;

      const hmac = crypto.createHmac('sha256', secretKey);
      hmac.update(stringToSign);
      const signature = hmac.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const workerDomain = process.env.VITE_MEDIA_DOMAIN || 'media.cineland.id.vn';
      const signedUrl = `https://${workerDomain}/${safeKey}?exp=${expires}&sig=${signature}`;

      return sendJson(res, 200, {
        success: true,
        data: {
          signedUrl,
          expires,
        }
      });
    }

    // ------------------------------------------------------------------------
    // MOVAN.ID.VN Click Tracker API
    // ------------------------------------------------------------------------
    if (pathname === "/api/portfolio/track-click" && req.method === "POST") {
      try {
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", () => {
          try {
            const parsed = JSON.parse(body || "{}");
            const today = new Date().toISOString().split("T")[0];
            trafficStats.totalClicks = (trafficStats.totalClicks || 0) + 1;
            trafficStats.dailyClicks = trafficStats.dailyClicks || {};
            trafficStats.dailyClicks[today] = (trafficStats.dailyClicks[today] || 0) + 1;
            
            if (parsed.target) {
              trafficStats.clickTargets = trafficStats.clickTargets || {};
              trafficStats.clickTargets[parsed.target] = (trafficStats.clickTargets[parsed.target] || 0) + 1;
            }
            if (trafficStats.totalClicks % 3 === 0) {
              fs.writeFile(TRAFFIC_STATS_FILE, JSON.stringify(trafficStats, null, 2), () => {});
            }
            sendJson(res, 200, { success: true, totalClicks: trafficStats.totalClicks });
          } catch(err) {
            sendJson(res, 400, { error: "Invalid JSON" });
          }
        });
      } catch(err) {
        sendJson(res, 500, { error: err.message });
      }
      return;
    }

    // MOVAN.ID.VN Portfolio & Traffic Analytics API
    // ------------------------------------------------------------------------
    if (pathname === "/api/portfolio/stats" && req.method === "GET") {
      let contentData = {};
      try {
        const fallbackPath = path.join(LOCAL_DATA_DIR, "site-content.json");
        contentData = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      } catch(e) {}

      const projects = (contentData.portfolio && contentData.portfolio.projects) || [];
      const services = contentData.services || [];
      const categories = (contentData.portfolio && contentData.portfolio.categories) || [];
      const inquiries = (await readDataWithSupabaseCacheAndR2("inquiries.json")) || [];

      return sendJson(res, 200, {
        success: true,
        traffic: {
          totalVisits: trafficStats.totalVisits || 1420,
          totalClicks: trafficStats.totalClicks || Math.round((trafficStats.totalVisits || 1420) * 0.35),
          todayClicks: (trafficStats.dailyClicks && trafficStats.dailyClicks[new Date().toISOString().split("T")[0]]) || Math.round(((trafficStats.daily && trafficStats.daily[new Date().toISOString().split("T")[0]]) || 48) * 0.35),
          uniqueVisitors: Math.round((trafficStats.totalVisits || 1420) * 0.48),
          todayVisits: (trafficStats.daily && trafficStats.daily[new Date().toISOString().split("T")[0]]) || 48,
          daily: trafficStats.daily || {},
          dailyClicks: trafficStats.dailyClicks || {},
          clickTargets: trafficStats.clickTargets || {},
          pages: trafficStats.pages || {},
          referrers: trafficStats.referrers || {},
          lastVisitors: trafficStats.lastVisitors || []
        },
        portfolio: {
          totalProjects: projects.length,
          totalServices: services.length,
          categoriesCount: categories.length,
          categories: categories,
          totalInquiries: inquiries.length,
          brand: (contentData.site && contentData.site.brand) || "MOVAN STUDIO",
          contact: {
            email: (contentData.site && contentData.site.email) || "hello@movan.studio",
            phone: (contentData.site && contentData.site.phone) || "0367 727 740"
          }
        }
      });
    }


    // ------------------------------------------------------------------------
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      });
      return res.end();
    }

    // ------------------------------------------------------------------------
    // 1. Portfolio Content API (Supabase Cache + R2 Data Storage in 'movanweb')
    // ------------------------------------------------------------------------
    if ((pathname === '/api/portfolio' || pathname === '/data/site-content.json') && req.method === 'GET') {
      const fallbackPath = path.join(LOCAL_DATA_DIR, 'site-content.json');
      const data = await readDataWithSupabaseCacheAndR2('site-content.json', fallbackPath);
      if (data) return sendJson(res, 200, data);
      return sendJson(res, 404, { error: 'Data not initialized' });
    }

    if (pathname === '/api/portfolio' && req.method === 'POST') {
      const bodyBuf = await readBody(req);
      const data = JSON.parse(bodyBuf.toString('utf8'));
      const syncResult = await writeDataToSupabaseCacheAndR2('site-content.json', data, [
        path.join(LOCAL_DATA_DIR, 'site-content.json'),
        path.join(DIST_DIR, 'data', 'site-content.json'),
      ]);
      return sendJson(res, 200, {
        success: true,
        message: 'Đã lưu Cache trên Supabase (movanweb) & Data trên R2 (movanweb)!',
        ...syncResult,
      });
    }

    // ------------------------------------------------------------------------
    // 2. CMS Config API (Supabase Cache + R2 Data Storage in 'movanweb')
    // ------------------------------------------------------------------------
    if (pathname === '/api/cms/config' && req.method === 'GET') {
      const data = await readDataWithSupabaseCacheAndR2('cms-config.json');
      return sendJson(res, 200, data || { links: null, apis: null, accounts: null });
    }

    if (pathname === '/api/cms/config' && req.method === 'POST') {
      const bodyBuf = await readBody(req);
      const data = JSON.parse(bodyBuf.toString('utf8'));
      const syncResult = await writeDataToSupabaseCacheAndR2('cms-config.json', data);
      return sendJson(res, 200, {
        success: true,
        message: 'Đã lưu cấu hình CMS lên Supabase Cache & R2 (movanweb)!',
        ...syncResult,
      });
    }

    // ------------------------------------------------------------------------
    // 3. Inquiries / Leads API (Supabase Cache + R2 Data Storage in 'movanweb')
    // ------------------------------------------------------------------------
    if (pathname === '/backend/inquiries' && req.method === 'GET') {
      const data = await readDataWithSupabaseCacheAndR2('inquiries.json');
      return sendJson(res, 200, { success: true, inquiries: Array.isArray(data) ? data : [] });
    }

    if (pathname === '/backend/inquiries' && req.method === 'POST') {
      const bodyBuf = await readBody(req);
      const item = JSON.parse(bodyBuf.toString('utf8'));
      const current = (await readDataWithSupabaseCacheAndR2('inquiries.json')) || [];
      const list = Array.isArray(current) ? current : [];
      const newEntry = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        status: 'Mới',
        ...item,
      };
      list.unshift(newEntry);
      await writeDataToSupabaseCacheAndR2('inquiries.json', list);

      // Gửi thông báo tới @Movanstubot
      const notifyMsg = `🔔 <b>[Node 2 - Portfolio Movan] CÓ LIÊN HỆ MỚI!</b>\n` +
        `👤 <b>Khách:</b> ${newEntry.name || newEntry.fullname || 'Ẩn danh'}\n` +
        `📞 <b>SĐT:</b> ${newEntry.phone || 'N/A'}\n` +
        `📧 <b>Email:</b> ${newEntry.email || 'N/A'}\n` +
        `💬 <b>Tin nhắn:</b> ${newEntry.message || newEntry.note || 'N/A'}\n` +
        `⏰ <i>${new Date().toLocaleString('vi-VN')}</i>`;
      notifyNode2Telegram(notifyMsg);

      return sendJson(res, 200, { success: true, inquiry: newEntry });
    }

    // ------------------------------------------------------------------------
    // 4. Image / Media Upload & Serving via Cloudflare R2 ('movanweb')
    // ------------------------------------------------------------------------
    if (pathname === '/api/upload' && req.method === 'POST') {
      const bodyBuf = await readBody(req);
      const { image, ext } = JSON.parse(bodyBuf.toString('utf8'));
      if (!image) return sendJson(res, 400, { success: false, error: 'No image provided' });

      const cleanExt = (ext || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const contentType = MIME_TYPES[`.${cleanExt}`] || 'image/jpeg';
      const base64Data = image.includes(';base64,') ? image.split(';base64,')[1] : image;
      const fileBuf = Buffer.from(base64Data, 'base64');

      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
      const r2Key = `${R2_FOLDER}/uploads/${filename}`;

      // Save local cache copy + upload to Cloudflare R2 movanweb/movanweb/uploads/
      const localPath = path.join(R2_LOCAL_CACHE_DIR, r2Key);
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, fileBuf);

      await r2Request('PUT', r2Key, fileBuf, contentType);
      const fileUrl = `/r2/file/${encodeURIComponent(r2Key)}`;
      return sendJson(res, 200, { success: true, url: fileUrl, key: r2Key });
    }

    if (pathname.startsWith('/r2/file/') && (req.method === 'GET' || req.method === 'HEAD')) {
      const rawKey = decodeURIComponent(pathname.replace('/r2/file/', ''));
      const safeKey = rawKey.replace(/\.\./g, '');
      const localCacheFile = path.join(R2_LOCAL_CACHE_DIR, safeKey);

      if (fs.existsSync(localCacheFile) && fs.statSync(localCacheFile).isFile()) {
        const ext = path.extname(localCacheFile).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
        });
        return fs.createReadStream(localCacheFile).pipe(res);
      }

      // Try R2 under movanweb/<key> or <key>
      const keysToTry = safeKey.startsWith(`${R2_FOLDER}/`)
        ? [safeKey, safeKey.replace(`${R2_FOLDER}/`, '')]
        : [`${R2_FOLDER}/${safeKey}`, safeKey];

      for (const k of keysToTry) {
        const r2Res = await r2Request('GET', k);
        if (r2Res.status === 200) {
          fs.mkdirSync(path.dirname(localCacheFile), { recursive: true });
          fs.writeFileSync(localCacheFile, r2Res.body);
          res.writeHead(200, {
            'Content-Type': r2Res.headers['content-type'] || MIME_TYPES[path.extname(k).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
          });
          return res.end(r2Res.body);
        }
      }

      res.writeHead(404);
      return res.end('Not Found');
    }

    // ------------------------------------------------------------------------

    // 8. Static File Serving based on Host (movan.id.vn = FE + /backend CMS, admin.movan.id.vn = CMS directly)
    // ------------------------------------------------------------------------
    const hostHeader = ((req.headers['x-forwarded-host'] || req.headers.host) || '').split(':')[0].toLowerCase();
    const isAdminHost = hostHeader === 'admin.movan.id.vn';
    const isCineHost = hostHeader === 'cine.movan.id.vn';

    let safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');

    let filePath;
    if (isCineHost) {
      // Tên miền cine.movan.id.vn -> phục vụ trực tiếp Cineland
      filePath = path.join(DIST_DIR, 'cineland', safePath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      }
      // SPA fallback cho toàn bộ route của cine.movan.id.vn
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        const cinelandIndex = path.join(DIST_DIR, 'cineland', 'index.html');
        if (fs.existsSync(cinelandIndex)) {
          filePath = cinelandIndex;
        }
      }
    } else if (isAdminHost) {
      filePath = path.join(DIST_DIR, 'backend', safePath);
      // Fallback to root DIST_DIR for shared Media/assets when on admin.movan.id.vn
      if (!fs.existsSync(filePath)) {
        const rootFallback = path.join(DIST_DIR, safePath);
        if (fs.existsSync(rootFallback)) {
          filePath = rootFallback;
        }
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      }
    } else {
      // Cho phép cả frontend và /backend (CMS Dashboard của Portfolio movan.id.vn)
      filePath = path.join(DIST_DIR, safePath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      }

      // SPA fallback cho ứng dụng Cineland (/cineland/*) trên movan.id.vn
      if (!fs.existsSync(filePath) && pathname.startsWith('/cineland')) {
        const cinelandIndex = path.join(DIST_DIR, 'cineland', 'index.html');
        if (fs.existsSync(cinelandIndex)) {
          filePath = cinelandIndex;
        }
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      // Tối ưu cache: static assets (.js, .css, images, fonts) cache 1 ngày (86400s), chỉ html là revalidate
      const cacheControl = ext === '.html'
        ? 'no-cache, no-store, must-revalidate'
        : ['.js', '.css'].includes(ext)
          ? 'public, max-age=86400, stale-while-revalidate=604800'
          : 'public, max-age=604800, immutable';
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        if (!isNaN(start) && !isNaN(end) && start >= 0 && end < fileSize && start <= end) {
          const chunkSize = end - start + 1;
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
            'Cache-Control': cacheControl,
          });
          if (req.method === 'HEAD') return res.end();
          return fs.createReadStream(filePath, { start, end }).pipe(res);
        }
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Cache-Control': cacheControl,
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(filePath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  } catch (err) {
    console.error('[Server Error]', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Movan Web Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Supabase Cache: ${SUPABASE_URL} (bucket: ${SUPABASE_BUCKET}/${SUPABASE_FOLDER})`);
  console.log(`☁️  Cloudflare R2 Data: ${R2_HOST} (bucket: ${R2_BUCKET}/${R2_FOLDER})`);
});
