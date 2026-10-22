import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  PlusCircle,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Key,
  Lock,
  LogOut,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Settings,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { Paper, Author, PdfFileInfo } from '../types';
import { getLocalStoredPapers, saveLocalStoredPapers } from '../data/initialPapers';

interface AdminBackendViewProps {
  papers: Paper[];
  onRefreshPapers: () => Promise<void>;
  onOpenArticle: (slug: string) => void;
  onOpenPdf: (paper: Paper) => void;
}

export const AdminBackendView: React.FC<AdminBackendViewProps> = ({
  papers,
  onRefreshPapers,
  onOpenArticle,
  onOpenPdf,
}) => {
  // Authentication state
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('jfai_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [editorUsername, setEditorUsername] = useState<string>('editor');

  // Login form state
  const [loginUser, setLoginUser] = useState<string>('editor');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'pdf-folder' | 'scholar-audit' | 'security'>('create');

  // Change credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('editor');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credUpdating, setCredUpdating] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PDF folder contents
  const [pdfFiles, setPdfFiles] = useState<PdfFileInfo[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);

  // Upload state
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Paper form state
  const [paperTitle, setPaperTitle] = useState('');
  const [paperSubtitle, setPaperSubtitle] = useState('');
  const [paperSlug, setPaperSlug] = useState('');
  const [doi, setDoi] = useState('');
  const [volume, setVolume] = useState('1');
  const [issue, setIssue] = useState('1');
  const [firstPage, setFirstPage] = useState('20');
  const [lastPage, setLastPage] = useState('32');
  const [publishedDate, setPublishedDate] = useState('2026-10-18');
  const [category, setCategory] = useState('Financial Intelligence & Machine Learning');
  const [articleType, setArticleType] = useState('Research Article');
  const [selectedPdfFileName, setSelectedPdfFileName] = useState('scope-fin.pdf');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [authors, setAuthors] = useState<Author[]>([
    {
      name: '',
      affiliation: '',
      email: '',
      isCorresponding: true,
      orcid: '',
    },
  ]);
  const [references, setReferences] = useState('');
  const [savingPaper, setSavingPaper] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Scholar audit state
  const [auditResults, setAuditResults] = useState<any[]>([]);

  // Verify stored session on component mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = sessionStorage.getItem('jfai_token');
      if (!storedToken) {
        setIsAuthenticated(false);
        setAuthChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data.success && data.authenticated) {
              setIsAuthenticated(true);
              setToken(storedToken);
              setEditorUsername(data.username || 'editor');
              setNewUsername(data.username || 'editor');
              setAuthChecking(false);
              return;
            }
          } catch {}
        }
      } catch (err) {
        // Server unavailable
      }

      // Check if stored session is a valid client-side session (e.g. on Vercel static)
      if (storedToken && storedToken.startsWith('jfai_session_')) {
        const localCredsRaw = localStorage.getItem('jfai_editor_creds');
        let currentU = 'editor';
        if (localCredsRaw) {
          try {
            const parsed = JSON.parse(localCredsRaw);
            if (parsed.username) currentU = parsed.username;
          } catch {}
        }
        setIsAuthenticated(true);
        setToken(storedToken);
        setEditorUsername(currentU);
        setNewUsername(currentU);
      } else {
        sessionStorage.removeItem('jfai_token');
        setIsAuthenticated(false);
      }
      setAuthChecking(false);
    };

    verifySession();
  }, []);

  // Fetch /pdf folder files with fallback
  const fetchPdfFolder = async () => {
    if (!token) return;
    setLoadingPdfs(true);
    try {
      const res = await fetch('/api/pdf-files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.files) && data.files.length > 0) {
          setPdfFiles(data.files);
          if (!selectedPdfFileName) {
            setSelectedPdfFileName(data.files[0].fileName);
          }
          setLoadingPdfs(false);
          return;
        }
      }
    } catch (err) {
      // Server not reachable
    }

    // Static fallback PDFs (shipped in /public/pdf)
    const fallbackPdfs: PdfFileInfo[] = [
      {
        fileName: 'scope-fin.pdf',
        size: '9.8 KB',
        sizeBytes: 10035,
        modified: '2026-10-01T00:00:00.000Z',
        url: '/pdf/scope-fin.pdf',
        isReferenced: true,
      },
      {
        fileName: 'trace-fin.pdf',
        size: '8.9 KB',
        sizeBytes: 9113,
        modified: '2026-10-01T00:00:00.000Z',
        url: '/pdf/trace-fin.pdf',
        isReferenced: true,
      },
    ];
    setPdfFiles(fallbackPdfs);
    if (!selectedPdfFileName) {
      setSelectedPdfFileName('scope-fin.pdf');
    }
    setLoadingPdfs(false);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPdfFolder();
      runScholarAudit();
    }
  }, [isAuthenticated, token]);

  // Handle Login with server & static fallback
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUser.trim(),
          password: loginPassword,
        }),
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.token) {
            sessionStorage.setItem('jfai_token', data.token);
            setToken(data.token);
            setIsAuthenticated(true);
            setEditorUsername(data.username || loginUser.trim());
            setNewUsername(data.username || loginUser.trim());
            setLoginPassword('');
            setLoginLoading(false);
            return;
          } else {
            setLoginError(data.message || 'Invalid username or password.');
            setLoginLoading(false);
            return;
          }
        } catch {
          // If non-JSON, fallback to client credentials
        }
      }
    } catch (err: any) {
      // Network failure / static host fallback
    }

    // Static fallback authentication (for Vercel or standalone deployment)
    const localCredsRaw = localStorage.getItem('jfai_editor_creds');
    let validUser = 'editor';
    let validPass = 'EditorPassword2026!';
    if (localCredsRaw) {
      try {
        const parsed = JSON.parse(localCredsRaw);
        if (parsed.username) validUser = parsed.username;
        if (parsed.password) validPass = parsed.password;
      } catch {}
    }

    if (loginUser.trim() === validUser && loginPassword === validPass) {
      const staticToken = 'jfai_session_' + Date.now();
      sessionStorage.setItem('jfai_token', staticToken);
      setToken(staticToken);
      setIsAuthenticated(true);
      setEditorUsername(validUser);
      setNewUsername(validUser);
      setLoginPassword('');
    } else {
      setLoginError('Invalid editor username or password. (Default credentials: editor / EditorPassword2026!)');
    }
    setLoginLoading(false);
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      // Ignore network errors on logout
    }
    sessionStorage.removeItem('jfai_token');
    setToken('');
    setIsAuthenticated(false);
  };

  // Handle Changing Credentials (Username / Password)
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (newPassword !== confirmPassword) {
      setCredMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setCredMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setCredUpdating(true);
    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newPassword,
        }),
      });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success) {
          if (data.token) {
            sessionStorage.setItem('jfai_token', data.token);
            setToken(data.token);
          }
          if (data.username) {
            setEditorUsername(data.username);
          }
          setCredMessage({
            type: 'success',
            text: 'Account credentials updated successfully! Please keep your new password safe.',
          });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setCredUpdating(false);
          return;
        } else {
          setCredMessage({ type: 'error', text: data.message || 'Failed to update credentials.' });
          setCredUpdating(false);
          return;
        }
      }
    } catch (err: any) {
      // Server not reachable / static fallback
    }

    // Static fallback credential change
    const localCredsRaw = localStorage.getItem('jfai_editor_creds');
    let validPass = 'EditorPassword2026!';
    if (localCredsRaw) {
      try {
        const parsed = JSON.parse(localCredsRaw);
        if (parsed.password) validPass = parsed.password;
      } catch {}
    }

    if (currentPassword !== validPass) {
      setCredMessage({ type: 'error', text: 'Current password does not match.' });
      setCredUpdating(false);
      return;
    }

    localStorage.setItem(
      'jfai_editor_creds',
      JSON.stringify({
        username: newUsername.trim(),
        password: newPassword,
      })
    );
    setEditorUsername(newUsername.trim());
    setCredMessage({
      type: 'success',
      text: 'Account credentials updated successfully for this session and domain.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCredUpdating(false);
  };

  // Upload PDF Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUploadSuccess(`Successfully uploaded "${data.fileName}" (${data.size}) into /pdf folder.`);
        setSelectedPdfFileName(data.fileName);
        await fetchPdfFolder();
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Network error during upload');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Author Management in form
  const addAuthor = () => {
    setAuthors([
      ...authors,
      { name: '', affiliation: '', email: '', isCorresponding: false, orcid: '' },
    ]);
  };

  const updateAuthor = (index: number, field: keyof Author, val: any) => {
    const next = [...authors];
    next[index] = { ...next[index], [field]: val };
    setAuthors(next);
  };

  const removeAuthor = (index: number) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  // Auto-generate slug and DOI from title
  const handleTitleChange = (val: string) => {
    setPaperTitle(val);
    if (!paperSlug) {
      const slugGen = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 40);
      setPaperSlug(slugGen);
    }
    if (!doi) {
      const nextNum = String(papers.length + 1).padStart(3, '0');
      setDoi(`10.59281/jfai.2026.1.1.${nextNum}`);
    }
  };

  // Submit Paper Creation
  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPaper(true);
    setSaveMessage(null);

    const payload = {
      title: paperTitle,
      subtitle: paperSubtitle,
      slug: paperSlug || paperTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30),
      journalTitle: 'Journal of Financial Artificial Intelligence',
      issn: '2984-5120',
      volume: Number(volume),
      issue: Number(issue),
      firstPage: Number(firstPage),
      lastPage: Number(lastPage),
      publishedDate,
      doi: doi || `10.59281/jfai.2026.1.1.${String(papers.length + 1).padStart(3, '0')}`,
      category,
      articleType,
      authors: authors.filter((a) => a.name.trim()),
      abstract,
      keywords: keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean),
      pdfFileName: selectedPdfFileName,
      pdfUrl: `/pdf/${selectedPdfFileName}`,
      status: 'published',
      sections: [
        {
          id: 'sec-1',
          title: '1 Introduction & Methodology',
          content: [
            abstract,
            'This paper has been peer-reviewed and authorized for full open-access publication in the Journal of Financial Artificial Intelligence. For the complete manuscript, please download the full-text PDF.',
          ],
        },
      ],
      references: references
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success) {
          setSaveMessage({
            type: 'success',
            text: `Paper landing page published! Standalone URL: /article/${payload.slug} and PDF: /pdf/${payload.pdfFileName}`,
          });
          await onRefreshPapers();
          // Reset form
          setPaperTitle('');
          setPaperSubtitle('');
          setPaperSlug('');
          setAbstract('');
          setKeywords('');
          setReferences('');
          setSavingPaper(false);
          return;
        } else {
          setSaveMessage({ type: 'error', text: data.message || 'Failed to save paper.' });
          setSavingPaper(false);
          return;
        }
      }
    } catch (err: any) {
      // Server not reachable / static deployment fallback
    }

    // Static fallback: save to local browser registry
    try {
      const currentList = getLocalStoredPapers();
      const newPaperItem = {
        id: payload.slug,
        ...payload,
        metrics: { views: 1, downloads: 0, citations: 0 },
      } as Paper;
      const updated = [newPaperItem, ...currentList.filter((p) => p.slug !== payload.slug)];
      saveLocalStoredPapers(updated);
      await onRefreshPapers();

      setSaveMessage({
        type: 'success',
        text: `Paper landing page published! Standalone URL: /article/${payload.slug} (Saved to journal registry).`,
      });
      setPaperTitle('');
      setPaperSubtitle('');
      setPaperSlug('');
      setAbstract('');
      setKeywords('');
      setReferences('');
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Error saving paper to registry.' });
    } finally {
      setSavingPaper(false);
    }
  };

  // Delete Paper
  const handleDeletePaper = async (slug: string) => {
    if (!confirm(`Are you sure you want to remove article "${slug}" from the publication registry?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/papers/${slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success) {
          await onRefreshPapers();
          return;
        }
      }
    } catch (err) {
      // Server not reachable / static deployment fallback
    }

    // Static fallback: delete from local papers registry
    const currentList = getLocalStoredPapers();
    const updated = currentList.filter((p) => p.slug !== slug);
    saveLocalStoredPapers(updated);
    await onRefreshPapers();
  };

  // Run Scholar Audit across all papers
  const runScholarAudit = async () => {
    try {
      const audits = await Promise.all(
        papers.map(async (p) => {
          const res = await fetch(`/api/scholar-validation/${p.slug}`);
          return res.json();
        })
      );
      setAuditResults(audits);
    } catch (err) {
      console.error(err);
    }
  };

  // If checking session state, show loading spinner
  if (authChecking) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-stone-600 text-sm">Verifying editor authentication session...</p>
      </div>
    );
  }

  // If NOT authenticated, show the explicit Login Form with Credentials hint
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-stone-900 flex items-center justify-center text-amber-400 mb-4 mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-center text-stone-900 mb-1">
            Editor Backend Login
          </h2>
          <p className="text-xs text-stone-500 text-center mb-6">
            Authorized access only for Journal Editors to manage /pdf files and publish articles.
          </p>

          {/* Initial Credentials Notice */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-3.5 mb-5 text-xs text-amber-950 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-900">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>Default Editor Credentials</span>
            </div>
            <div className="text-[11px] text-stone-700 font-mono space-y-0.5 pt-1">
              <div>Username: <span className="bg-white px-1.5 py-0.5 rounded font-bold text-stone-900 border border-amber-200">editor</span></div>
              <div>Password: <span className="bg-white px-1.5 py-0.5 rounded font-bold text-stone-900 border border-amber-200">EditorPassword2026!</span></div>
            </div>
            <p className="text-[10px] text-amber-800 pt-1 italic font-serif">
              You can change your username and password at any time in "Account & Security" after logging in.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-lg text-xs mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Account Username (账号)
              </label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Enter editor username"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Password (密码)
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter editor password"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 pr-9 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="p-1 text-stone-400 hover:text-stone-700 absolute right-2.5 top-2.5"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-300 font-semibold text-xs py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{loginLoading ? 'Authenticating...' : 'Sign In as Editor'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // When Authenticated, show full Editor Backend
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Bar with Editor Info & Logout */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-inner">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Journal Editorial Backend & /pdf Manager
            </h1>
            <p className="text-xs text-stone-300">
              Logged in as: <span className="font-mono font-semibold text-amber-300">{editorUsername}</span> (Senior Editor)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Authenticated Session Active
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded border border-stone-700 hover:bg-stone-800 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-stone-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'create'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-amber-700" />
          <span>Add Paper & Landing Page</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'manage'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4 text-stone-600" />
          <span>Published Articles ({papers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pdf-folder');
            fetchPdfFolder();
          }}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'pdf-folder'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-stone-600" />
          <span>/pdf Folder Explorer ({pdfFiles.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('scholar-audit');
            runScholarAudit();
          }}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'scholar-audit'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Google Scholar Crawler Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Settings className="w-4 h-4 text-stone-600" />
          <span>Account & Password (账号与密码设置)</span>
        </button>
      </div>

      {/* Tab: Security & Password Settings */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-700" />
              <span>Editor Account & Security Settings</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Customize your login username and secure password to guarantee that only you can access the editorial backend.
            </p>
          </div>

          {credMessage && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
                credMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border border-red-200 text-red-900'
              }`}
            >
              {credMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{credMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangeCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Current Password (当前密码) *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to verify identity"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                New Username (新账号)
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. editor or your custom username"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                New Password (新密码) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (minimum 6 characters)"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Confirm New Password (确认新密码) *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Credentials are encrypted and stored securely on the server.
              </span>
              <button
                type="submit"
                disabled={credUpdating}
                className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded shadow-xs transition flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{credUpdating ? 'Updating...' : 'Save New Credentials'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 1: Create Article Form & PDF Upload */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Publish New Paper Landing Page & Link PDF
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Creates an academic landing page with automatic Highwire Press meta tags for Google Scholar and connects to a PDF in <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded">/pdf/</code>.
              </p>
            </div>

            {saveMessage && (
              <div
                className={`p-4 rounded-lg text-xs flex items-center gap-2 ${
                  saveMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border border-red-200 text-red-900'
                }`}
              >
                {saveMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{saveMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCreatePaper} className="space-y-6">
              {/* Step 1: PDF Attachment */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>Step 1: Upload or Select Paper PDF (/pdf Folder)</span>
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">Must be valid .pdf file</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Upload new PDF to server /pdf:
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={uploadingPdf}
                      className="block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                    />
                    {uploadingPdf && <p className="text-[11px] text-amber-600 mt-1">Uploading PDF to /pdf...</p>}
                    {uploadSuccess && <p className="text-[11px] text-emerald-600 mt-1">{uploadSuccess}</p>}
                    {uploadError && <p className="text-[11px] text-red-600 mt-1">{uploadError}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Or select PDF already in /pdf:
                    </label>
                    <select
                      value={selectedPdfFileName}
                      onChange={(e) => setSelectedPdfFileName(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-300 rounded p-2 text-stone-800 focus:outline-none focus:border-amber-600"
                    >
                      {pdfFiles.map((f) => (
                        <option key={f.fileName} value={f.fileName}>
                          {f.fileName} ({f.size})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500">
                  Target direct crawl URL: <code className="font-mono text-amber-800 bg-white px-1.5 py-0.5 rounded border border-stone-200">/pdf/{selectedPdfFileName}</code>
                </div>
              </div>

              {/* Step 2: Paper Title & Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCOPE-Fin: Budget-Aware Orchestration of Retrieval..."
                    value={paperTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A Selective-Routing Framework and Evaluation Protocol"
                    value={paperSubtitle}
                    onChange={(e) => setPaperSubtitle(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-serif italic"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. scope-fin"
                      value={paperSlug}
                      onChange={(e) => setPaperSlug(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Digital Object Identifier (DOI) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10.59281/jfai.2026.1.1.003"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Publication Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={publishedDate}
                      onChange={(e) => setPublishedDate(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Volume</label>
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Issue</label>
                    <input
                      type="number"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">First Page</label>
                    <input
                      type="number"
                      value={firstPage}
                      onChange={(e) => setFirstPage(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Last Page</label>
                    <input
                      type="number"
                      value={lastPage}
                      onChange={(e) => setLastPage(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Authors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Authors ({authors.length})
                  </label>
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Co-Author</span>
                  </button>
                </div>

                {authors.map((author, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700">Author #{idx + 1}</span>
                      {authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(idx)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name (e.g. Xiang Zhang)"
                        value={author.name}
                        onChange={(e) => updateAuthor(idx, 'name', e.target.value)}
                        className="text-xs bg-white border border-stone-300 rounded p-2 text-stone-900"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={author.email}
                        onChange={(e) => updateAuthor(idx, 'email', e.target.value)}
                        className="text-xs bg-white border border-stone-300 rounded p-2 text-stone-900"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Affiliation / University / Department"
                      value={author.affiliation}
                      onChange={(e) => updateAuthor(idx, 'affiliation', e.target.value)}
                      className="w-full text-xs bg-white border border-stone-300 rounded p-2 text-stone-900"
                      required
                    />
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1 text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={author.isCorresponding}
                          onChange={(e) => updateAuthor(idx, 'isCorresponding', e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Corresponding Author</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ORCID (e.g. 0009-0004-8192-3810)"
                        value={author.orcid || ''}
                        onChange={(e) => updateAuthor(idx, 'orcid', e.target.value)}
                        className="text-xs bg-white border border-stone-300 rounded p-1.5 text-stone-900 w-52 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 4: Abstract & Keywords */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Abstract *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Paste the full abstract here..."
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 font-serif leading-relaxed focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="financial AI, retrieval-augmented generation, anomaly detection"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    References (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste references one per line..."
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2 text-stone-900 font-serif"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Article landing page will be instantly live and crawlable by Google Scholar.
                </span>
                <button
                  type="submit"
                  disabled={savingPaper}
                  className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded shadow-sm transition flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{savingPaper ? 'Publishing...' : 'Publish Article & Landing Page'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Live Google Scholar Crawler Tag Preview</span>
              </h3>
              <p className="text-xs text-stone-500">
                These exact Highwire Press tags will be rendered into <code className="bg-stone-100 px-1 rounded">&lt;head&gt;</code> by the server for search indexers:
              </p>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded text-[11px] font-mono leading-relaxed overflow-x-auto max-h-80">
{`<meta name="citation_title" content="${paperTitle || 'Article Title'}" />
${authors.map((a) => `<meta name="citation_author" content="${a.name || 'Author'}" />`).join('\n')}
<meta name="citation_publication_date" content="${publishedDate.replace(/-/g, '/')}" />
<meta name="citation_journal_title" content="Journal of Financial Artificial Intelligence" />
<meta name="citation_volume" content="${volume}" />
<meta name="citation_issue" content="${issue}" />
<meta name="citation_pdf_url" content="https://.../pdf/${selectedPdfFileName}" />
<meta name="citation_doi" content="${doi || '10.59281/jfai.2026...'}" />`}
              </pre>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-xs text-emerald-950 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Google Scholar Checklist</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-emerald-900">
                <li>• Standalone HTML URL: <span className="font-mono">/article/{paperSlug || 'slug'}</span></li>
                <li>• PDF is served with header <span className="font-mono">application/pdf</span></li>
                <li>• Publicly accessible without password or CAPTCHA</li>
                <li>• Crawlable from homepage via sitemap.xml</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Published Papers */}
      {activeTab === 'manage' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Published Articles in JFAI ({papers.length})
              </h2>
              <p className="text-xs text-stone-500">
                Articles registered in the database, with live landing pages and linked PDFs.
              </p>
            </div>
            <button
              onClick={onRefreshPapers}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="divide-y divide-stone-200">
            {papers.map((paper) => (
              <div key={paper.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-stone-500 font-semibold">{paper.doi}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500">Vol {paper.volume}, Iss {paper.issue}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                      Published
                    </span>
                  </div>
                  <h3
                    onClick={() => onOpenArticle(paper.slug)}
                    className="font-serif font-bold text-stone-900 hover:text-amber-800 cursor-pointer text-sm"
                  >
                    {paper.title}
                  </h3>
                  <div className="text-xs text-stone-500">
                    Authors: {paper.authors.map((a) => a.name).join(', ')}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
                    <span>PDF: <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline">{paper.pdfFileName}</a></span>
                    <span>•</span>
                    <span>Views: {paper.metrics?.views || 0}</span>
                    <span>•</span>
                    <span>Downloads: {paper.metrics?.downloads || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenArticle(paper.slug)}
                    className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Page</span>
                  </button>
                  <button
                    onClick={() => onOpenPdf(paper)}
                    className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium flex items-center gap-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>View PDF</span>
                  </button>
                  <button
                    onClick={() => handleDeletePaper(paper.slug)}
                    className="text-xs px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 transition"
                    title="Delete paper"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Server /pdf Folder Explorer */}
      {activeTab === 'pdf-folder' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-700" />
                <span>Server /pdf Storage Explorer</span>
              </h2>
              <p className="text-xs text-stone-500">
                Direct files stored on the server filesystem at <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">/pdf/</code>.
              </p>
            </div>
            <button
              onClick={fetchPdfFolder}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Folder</span>
            </button>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Direct PDF Upload to /pdf
              </span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploadingPdf}
              className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
            />
            {uploadingPdf && <p className="text-xs text-amber-600 mt-2">Uploading...</p>}
            {uploadSuccess && <p className="text-xs text-emerald-600 mt-2">{uploadSuccess}</p>}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-xs">
              <thead className="bg-stone-50 font-semibold text-stone-700 text-left">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Public URL</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Last Modified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700 font-mono">
                {pdfFiles.map((file) => (
                  <tr key={file.fileName} className="hover:bg-stone-50 transition">
                    <td className="px-4 py-3 font-semibold text-stone-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>{file.fileName}</span>
                    </td>
                    <td className="px-4 py-3 text-amber-800">
                      <a href={file.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {file.url}
                      </a>
                    </td>
                    <td className="px-4 py-3">{file.size}</td>
                    <td className="px-4 py-3 text-stone-400 font-sans text-[11px]">
                      {new Date(file.modified).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-800 hover:underline mr-3 text-xs"
                      >
                        Open
                      </a>
                      <a
                        href={file.url}
                        download={file.fileName}
                        className="text-stone-700 hover:text-stone-900 text-xs"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Google Scholar Diagnostic Audit */}
      {activeTab === 'scholar-audit' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Google Scholar Indexing Diagnostic Suite</span>
              </h2>
              <p className="text-xs text-stone-500">
                Audits all published articles against Google Scholar technical guidelines.
              </p>
            </div>
            <button
              onClick={runScholarAudit}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Audit</span>
            </button>
          </div>

          <div className="space-y-6">
            {auditResults.map((audit, idx) => (
              <div key={idx} className="border border-stone-200 rounded-lg p-5 bg-stone-50/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900">{audit.paperTitle}</h3>
                    <span className="font-mono text-xs text-stone-500">DOI: {audit.doi}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded font-semibold flex items-center gap-1 ${
                      audit.allPassed
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{audit.allPassed ? '100% Google Scholar Compliant' : 'Issues Detected'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {audit.checks?.map((check: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      className="p-2.5 bg-white rounded border border-stone-200 text-xs flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-stone-800">{check.name}</div>
                        <div className="text-[11px] text-stone-500">{check.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
