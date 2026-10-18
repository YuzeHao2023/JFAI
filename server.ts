import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure directories exist
const pdfDir = path.resolve(__dirname, 'pdf');
const publicPdfDir = path.resolve(__dirname, 'public/pdf');
const dataDir = path.resolve(__dirname, 'data');
const papersFilePath = path.resolve(dataDir, 'papers.json');
const authFilePath = path.resolve(dataDir, 'editor-auth.json');

fs.mkdirSync(pdfDir, { recursive: true });
fs.mkdirSync(publicPdfDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

// Active in-memory session tokens: token -> { username, expiresAt }
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function getEditorAuth(): { username: string; salt: string; passwordHash: string } {
  try {
    if (fs.existsSync(authFilePath)) {
      const data = fs.readFileSync(authFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read editor-auth.json:', err);
  }
  // Initialize default credentials if not found
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword('EditorPassword2026!', salt);
  const defaultAuth = {
    username: 'editor',
    salt,
    passwordHash,
    lastModified: new Date().toISOString(),
  };
  fs.writeFileSync(authFilePath, JSON.stringify(defaultAuth, null, 2), 'utf-8');
  return defaultAuth;
}

function saveEditorAuth(auth: { username: string; salt: string; passwordHash: string }) {
  fs.writeFileSync(authFilePath, JSON.stringify({ ...auth, lastModified: new Date().toISOString() }, null, 2), 'utf-8');
}

// Authentication middleware to protect editorial routes
function requireEditorAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.headers['x-editor-token'] as string);

  if (token && activeSessions.has(token)) {
    const session = activeSessions.get(token)!;
    if (session.expiresAt > Date.now()) {
      (req as any).editorUser = session.username;
      return next();
    } else {
      activeSessions.delete(token);
    }
  }

  // Fallback for legacy environment passkey if configured
  const legacyKey = req.headers['x-editor-key'];
  if (legacyKey && process.env.EDITOR_PASSKEY && legacyKey === process.env.EDITOR_PASSKEY) {
    (req as any).editorUser = 'env-admin';
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Editor authorization required. Please log in with your editor credentials.',
  });
}

// Setup multer for PDF uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, pdfDir);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename to lowercase alphanumeric with hyphen/underscore
    const originalExt = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    const safeName = `${baseName || 'paper'}-${Date.now()}${originalExt || '.pdf'}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for publication.'));
    }
  },
});

// JSON and URL-encoded body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to get papers
function getPapers(): any[] {
  try {
    if (fs.existsSync(papersFilePath)) {
      const data = fs.readFileSync(papersFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read papers.json:', err);
  }
  return [];
}

function savePapers(papers: any[]) {
  fs.writeFileSync(papersFilePath, JSON.stringify(papers, null, 2), 'utf-8');
}

// Serve PDF files directly from /pdf route with correct academic and crawler headers
app.use(
  '/pdf',
  express.static(pdfDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Robots-Tag', 'all');
    },
  })
);

// Fallback serve for public/pdf
app.use(
  '/pdf',
  express.static(publicPdfDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

// Dynamic Robots.txt for Google Scholar and Web Crawlers
app.get('/robots.txt', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host') || 'localhost:3000';
  const siteUrl = `${protocol}://${host}`;

  const robots = `# JFAI Academic Journal Robots Configuration
User-agent: *
Allow: /
Allow: /article/
Allow: /pdf/
Allow: /archive
Allow: /articles
Allow: /sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Mobile
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  res.type('text/plain').send(robots);
});

// Dynamic Google Scholar & Search Engine Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  const papers = getPapers();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/submit</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/editorial-board</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/scholar-guide</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

  for (const paper of papers) {
    const pubDate = paper.publishedDate || new Date().toISOString().split('T')[0];
    xml += `  <url>
    <loc>${baseUrl}/article/${paper.slug}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${baseUrl}${paper.pdfUrl || `/pdf/${paper.pdfFileName}`}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  res.type('application/xml').send(xml);
});

// ----------------- REST APIs -----------------

// Authentication Endpoints for Editor
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const auth = getEditorAuth();
  const inputHash = hashPassword(password, auth.salt);

  if (username !== auth.username || inputHash !== auth.passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  // Generate 24-hour session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  activeSessions.set(token, { username: auth.username, expiresAt });

  res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    username: auth.username,
    expiresIn: 86400,
  });
});

app.get('/api/auth/verify', requireEditorAuth, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    username: (req as any).editorUser,
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.headers['x-editor-token'] as string);
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/change-credentials', requireEditorAuth, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  const auth = getEditorAuth();
  const currentHash = hashPassword(currentPassword, auth.salt);

  if (currentHash !== auth.passwordHash) {
    return res.status(400).json({ success: false, message: 'Incorrect current password.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newPasswordHash = hashPassword(newPassword, newSalt);
  const updatedUsername = newUsername && newUsername.trim().length >= 3 ? newUsername.trim() : auth.username;

  saveEditorAuth({
    username: updatedUsername,
    salt: newSalt,
    passwordHash: newPasswordHash,
  });

  // Clear existing sessions and create a fresh session for the editor
  activeSessions.clear();
  const newToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  activeSessions.set(newToken, { username: updatedUsername, expiresAt });

  res.json({
    success: true,
    message: 'Editor account credentials updated successfully.',
    token: newToken,
    username: updatedUsername,
  });
});

// 1. List all papers
app.get('/api/papers', (_req, res) => {
  const papers = getPapers();
  res.json({ success: true, count: papers.length, papers });
});

// 2. Get single paper
app.get('/api/papers/:slug', (req, res) => {
  const papers = getPapers();
  const paper = papers.find((p) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }
  res.json({ success: true, paper });
});

// 3. Create or update paper (Backend editorial functionality - protected)
app.post('/api/papers', requireEditorAuth, (req, res) => {
  const {
    id,
    slug,
    title,
    subtitle,
    journalTitle,
    issn,
    volume,
    issue,
    firstPage,
    lastPage,
    publishedDate,
    doi,
    category,
    articleType,
    license,
    authors,
    abstract,
    keywords,
    pdfFileName,
    pdfUrl,
    pdfSize,
    status,
    sections,
    references,
  } = req.body;

  if (!title || !abstract) {
    return res.status(400).json({ success: false, message: 'Title and abstract are required.' });
  }

  const cleanSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);

  const papers = getPapers();
  const existingIdx = papers.findIndex((p) => p.slug === cleanSlug || (id && p.id === id));

  const paperData = {
    id: id || cleanSlug,
    slug: cleanSlug,
    title,
    subtitle: subtitle || '',
    journalTitle: journalTitle || 'Journal of Financial Artificial Intelligence',
    issn: issn || '2984-5120',
    volume: Number(volume) || 1,
    issue: Number(issue) || 1,
    firstPage: Number(firstPage) || 1,
    lastPage: Number(lastPage) || 10,
    publishedDate: publishedDate || new Date().toISOString().split('T')[0],
    doi: doi || `10.59281/jfai.2026.1.1.${String(papers.length + 1).padStart(3, '0')}`,
    category: category || 'Financial Intelligence',
    articleType: articleType || 'Research Article',
    license: license || 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    authors: Array.isArray(authors) && authors.length > 0 ? authors : [
      { name: 'Contributing Author', affiliation: 'Academic Institution', email: 'author@academic.edu' },
    ],
    abstract,
    keywords: Array.isArray(keywords)
      ? keywords
      : typeof keywords === 'string'
      ? keywords.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean)
      : [],
    pdfFileName: pdfFileName || `${cleanSlug}.pdf`,
    pdfUrl: pdfUrl || `/pdf/${pdfFileName || `${cleanSlug}.pdf`}`,
    pdfSize: pdfSize || '120 KB',
    status: status || 'published',
    metrics: existingIdx >= 0 && papers[existingIdx].metrics ? papers[existingIdx].metrics : { views: 1, downloads: 0, citations: 0 },
    sections: Array.isArray(sections) ? sections : [],
    references: Array.isArray(references) ? references : [],
  };

  if (existingIdx >= 0) {
    papers[existingIdx] = { ...papers[existingIdx], ...paperData };
  } else {
    papers.push(paperData);
  }

  savePapers(papers);
  res.json({ success: true, message: 'Article saved successfully', paper: paperData });
});

// 4. Delete paper (protected)
app.delete('/api/papers/:slug', requireEditorAuth, (req, res) => {
  const papers = getPapers();
  const filtered = papers.filter((p) => p.slug !== req.params.slug && p.id !== req.params.slug);

  if (filtered.length === papers.length) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }

  savePapers(filtered);
  res.json({ success: true, message: 'Article deleted successfully' });
});

// 5. PDF Upload to /pdf folder (protected)
app.post('/api/upload-pdf', requireEditorAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
  }

  // Also copy to public/pdf for build/vite synchronization
  try {
    const destInPublic = path.resolve(publicPdfDir, req.file.filename);
    fs.copyFileSync(req.file.path, destInPublic);
  } catch (err) {
    console.warn('Could not mirror PDF to public/pdf:', err);
  }

  const sizeKb = (req.file.size / 1024).toFixed(1) + ' KB';
  res.json({
    success: true,
    message: 'PDF uploaded successfully to /pdf directory.',
    fileName: req.file.filename,
    url: `/pdf/${req.file.filename}`,
    size: sizeKb,
  });
});

// 6. List all files currently inside /pdf directory (protected)
app.get('/api/pdf-files', requireEditorAuth, (_req, res) => {
  try {
    const files = fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    const details = files.map((name) => {
      const stats = fs.statSync(path.resolve(pdfDir, name));
      return {
        fileName: name,
        url: `/pdf/${name}`,
        size: `${(stats.size / 1024).toFixed(1)} KB`,
        modified: stats.mtime,
      };
    });
    res.json({ success: true, count: details.length, files: details });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to inspect /pdf directory' });
  }
});

// 7. Increment article view/download metrics
app.post('/api/metrics/:slug/:action', (req, res) => {
  const { slug, action } = req.params;
  const papers = getPapers();
  const idx = papers.findIndex((p) => p.slug === slug || p.id === slug);
  if (idx >= 0) {
    if (!papers[idx].metrics) {
      papers[idx].metrics = { views: 0, downloads: 0, citations: 0 };
    }
    if (action === 'view') papers[idx].metrics.views += 1;
    if (action === 'download') papers[idx].metrics.downloads += 1;
    savePapers(papers);
    return res.json({ success: true, metrics: papers[idx].metrics });
  }
  res.status(404).json({ success: false, message: 'Not found' });
});

// 8. Handle manuscript submission log & validation
app.post('/api/submissions/record', (req, res) => {
  const { manuscriptTitle, correspondingAuthor, email, abstract, wordCount, keywords } = req.body;
  // Record submission in memory/log
  console.log(`[Submission Received via Mail Portal]:`, {
    manuscriptTitle,
    correspondingAuthor,
    email,
    abstract: abstract?.substring(0, 100),
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Submission intent logged. Please send the finalized manuscript package to haoyuze2024@gmail.com.',
    submissionId: `JFAI-${Date.now().toString().slice(-6)}`,
  });
});

// 9. Google Scholar Indexing Compliance Diagnostic Checker
app.get('/api/scholar-validation/:slug', (req, res) => {
  const papers = getPapers();
  const paper = papers.find((p) => p.slug === req.params.slug);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Paper not found' });
  }

  const pdfPath = path.resolve(pdfDir, paper.pdfFileName);
  const pdfExists = fs.existsSync(pdfPath);

  const checks = [
    {
      name: 'Direct PDF URL (citation_pdf_url)',
      passed: Boolean(paper.pdfUrl && pdfExists),
      detail: pdfExists
        ? `PDF found at ${paper.pdfUrl} (${paper.pdfSize || 'valid'})`
        : `File ${paper.pdfFileName} missing in /pdf folder`,
    },
    {
      name: 'Paper Title (citation_title)',
      passed: Boolean(paper.title && paper.title.length > 5),
      detail: paper.title,
    },
    {
      name: 'Author Identification (citation_author)',
      passed: Boolean(paper.authors && paper.authors.length > 0 && paper.authors[0].name),
      detail: `${paper.authors?.length || 0} author(s) tagged individually`,
    },
    {
      name: 'Publication Date (citation_publication_date)',
      passed: Boolean(paper.publishedDate && /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(paper.publishedDate)),
      detail: `ISO Date: ${paper.publishedDate} (YYYY/MM/DD standard compliant)`,
    },
    {
      name: 'Journal Title & Volume/Issue (citation_journal_title)',
      passed: Boolean(paper.journalTitle && paper.volume),
      detail: `${paper.journalTitle}, Vol. ${paper.volume}, Iss. ${paper.issue}`,
    },
    {
      name: 'Pagination (citation_firstpage, citation_lastpage)',
      passed: Boolean(paper.firstPage && paper.lastPage),
      detail: `pp. ${paper.firstPage}-${paper.lastPage}`,
    },
    {
      name: 'Digital Object Identifier (citation_doi)',
      passed: Boolean(paper.doi && paper.doi.startsWith('10.')),
      detail: paper.doi,
    },
    {
      name: 'Crawl Path & Robots.txt Accessibility',
      passed: true,
      detail: 'Robots.txt allows User-agent: Googlebot with direct sitemap.xml',
    },
  ];

  const allPassed = checks.every((c) => c.passed);
  res.json({
    success: true,
    paperTitle: paper.title,
    doi: paper.doi,
    allPassed,
    checks,
  });
});

// ----------------- Server-Side Google Scholar Meta Injection -----------------

function generateScholarMetaTags(paper: any, baseUrl: string): string {
  const authorsTags = (paper.authors || [])
    .map((author: any) => {
      let tags = `    <meta name="citation_author" content="${author.name}" />\n`;
      if (author.affiliation) {
        tags += `    <meta name="citation_author_institution" content="${author.affiliation}" />\n`;
      }
      if (author.email) {
        tags += `    <meta name="citation_author_email" content="${author.email}" />\n`;
      }
      return tags;
    })
    .join('');

  const formattedDate = paper.publishedDate
    ? paper.publishedDate.replace(/-/g, '/')
    : '2026/10/01';

  const fullPdfUrl = `${baseUrl}${paper.pdfUrl || `/pdf/${paper.pdfFileName}`}`;
  const fullHtmlUrl = `${baseUrl}/article/${paper.slug}`;

  return `
    <!-- Google Scholar Highwire Press Tags -->
    <meta name="citation_title" content="${paper.title.replace(/"/g, '&quot;')}" />
${authorsTags}    <meta name="citation_publication_date" content="${formattedDate}" />
    <meta name="citation_journal_title" content="${paper.journalTitle || 'Journal of Financial Artificial Intelligence'}" />
    <meta name="citation_issn" content="${paper.issn || '2984-5120'}" />
    <meta name="citation_volume" content="${paper.volume || 1}" />
    <meta name="citation_issue" content="${paper.issue || 1}" />
    <meta name="citation_firstpage" content="${paper.firstPage || 1}" />
    <meta name="citation_lastpage" content="${paper.lastPage || 10}" />
    <meta name="citation_pdf_url" content="${fullPdfUrl}" />
    <meta name="citation_abstract_html_url" content="${fullHtmlUrl}" />
    <meta name="citation_doi" content="${paper.doi || ''}" />
    <meta name="citation_keywords" content="${(paper.keywords || []).join('; ')}" />

    <!-- Dublin Core Metadata for Academic Harvesters -->
    <meta name="dc.title" content="${paper.title.replace(/"/g, '&quot;')}" />
    <meta name="dc.creator" content="${paper.authors?.[0]?.name || 'Xiang Zhang'}" />
    <meta name="dc.issued" content="${paper.publishedDate || '2026-10-01'}" />
    <meta name="dc.identifier" content="${paper.doi || ''}" />
    <meta name="dc.relation.isformatof" content="${fullPdfUrl}" />

    <!-- OpenGraph Tags -->
    <meta property="og:title" content="${paper.title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${(paper.abstract || '').slice(0, 200).replace(/"/g, '&quot;')}..." />
    <meta property="og:url" content="${fullHtmlUrl}" />
    <meta property="og:type" content="article" />
  `;
}

// ----------------- Vite or Production Static Serving -----------------

async function startServer() {
  let vite: any;
  if (!isProd) {
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  // Handle HTML rendering with dynamic Google Scholar tags for article pages
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template: string;
      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
      }

      // Check if this is an article landing page request (e.g. /article/scope-fin)
      const articleMatch = url.match(/^\/article\/([a-zA-Z0-9-_]+)/);
      if (articleMatch) {
        const slug = articleMatch[1];
        const papers = getPapers();
        const paper = papers.find((p) => p.slug === slug || p.id === slug);
        if (paper) {
          const protocol = req.headers['x-forwarded-proto'] || req.protocol;
          const host = req.get('host') || 'localhost:3000';
          const baseUrl = `${protocol}://${host}`;
          const scholarMeta = generateScholarMetaTags(paper, baseUrl);

          // Replace title and inject scholar tags right inside <head>
          template = template.replace(
            /<title>(.*?)<\/title>/,
            `<title>${paper.title} – Journal of Financial Artificial Intelligence</title>`
          );
          template = template.replace('</head>', `${scholarMeta}\n</head>`);
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Academic Journal server running on http://0.0.0.0:${PORT}`);
    console.log(`PDF folder served at http://0.0.0.0:${PORT}/pdf/`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
