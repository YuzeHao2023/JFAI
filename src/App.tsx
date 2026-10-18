/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ArticlesView } from './views/ArticlesView';
import { ArticleDetailView } from './views/ArticleDetailView';
import { SubmitManuscriptView } from './views/SubmitManuscriptView';
import { EditorialBoardView } from './views/EditorialBoardView';
import { AdminBackendView } from './views/AdminBackendView';
import { CitationModal } from './components/CitationModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { Paper } from './types';

export default function App() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [citationPaper, setCitationPaper] = useState<Paper | null>(null);
  const [pdfViewerPaper, setPdfViewerPaper] = useState<Paper | null>(null);

  // Fetch papers from server API
  const fetchPapers = async () => {
    try {
      const res = await fetch('/api/papers');
      const data = await res.json();
      if (data.success && Array.isArray(data.papers)) {
        setPapers(data.papers);
      }
    } catch (err) {
      console.error('Failed to load papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  // Sync with browser URL / history on load and popstate
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/article/')) {
        const slug = path.replace('/article/', '');
        setCurrentArticleSlug(slug);
        setCurrentView('article-detail');
      } else if (path === '/articles') {
        setCurrentView('articles');
      } else if (path === '/submit') {
        setCurrentView('submit');
      } else if (path === '/editorial-board') {
        setCurrentView('editorial-board');
      } else if (path === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Dynamic meta tags and document.title update
  useEffect(() => {
    if (currentView === 'article-detail' && currentArticleSlug) {
      const paper = papers.find((p) => p.slug === currentArticleSlug);
      if (paper) {
        document.title = `${paper.title} – JFAI`;
        // Ensure client-side meta tags match for SPA navigation
        updateClientScholarTags(paper);
      }
    } else {
      document.title = 'JFAI – Journal of Financial Artificial Intelligence';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, currentArticleSlug, papers]);

  // Client-side helper for Highwire tags
  const updateClientScholarTags = (paper: Paper) => {
    // Remove existing dynamic tags
    const existingTags = document.querySelectorAll('meta[name^="citation_"], meta[name^="dc."]');
    existingTags.forEach((t) => t.remove());

    const head = document.head;
    const addMeta = (name: string, content: string) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      head.appendChild(meta);
    };

    addMeta('citation_title', paper.title);
    paper.authors.forEach((a) => {
      addMeta('citation_author', a.name);
      if (a.affiliation) addMeta('citation_author_institution', a.affiliation);
    });
    addMeta('citation_publication_date', paper.publishedDate.replace(/-/g, '/'));
    addMeta('citation_journal_title', paper.journalTitle);
    addMeta('citation_issn', paper.issn);
    addMeta('citation_volume', String(paper.volume));
    addMeta('citation_issue', String(paper.issue));
    addMeta('citation_firstpage', String(paper.firstPage));
    addMeta('citation_lastpage', String(paper.lastPage));
    addMeta('citation_pdf_url', `${window.location.origin}${paper.pdfUrl}`);
    addMeta('citation_abstract_html_url', `${window.location.origin}/article/${paper.slug}`);
    addMeta('citation_doi', paper.doi);
  };

  const handleNavigate = (view: string, slug?: string) => {
    setCurrentView(view);
    if (view === 'article-detail' && slug) {
      setCurrentArticleSlug(slug);
      window.history.pushState({}, '', `/article/${slug}`);
    } else if (view === 'articles') {
      window.history.pushState({}, '', '/articles');
    } else if (view === 'submit') {
      window.history.pushState({}, '', '/submit');
    } else if (view === 'editorial-board') {
      window.history.pushState({}, '', '/editorial-board');
    } else if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const activeArticle = papers.find((p) => p.slug === currentArticleSlug) || papers[0];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Body */}
      <div className="flex-1">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-serif text-stone-600 text-sm">Loading scholarly repository...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                papers={papers}
                onNavigate={handleNavigate}
                onOpenArticle={(slug) => handleNavigate('article-detail', slug)}
                onOpenPdf={(paper) => setPdfViewerPaper(paper)}
                onOpenCite={(paper) => setCitationPaper(paper)}
              />
            )}

            {currentView === 'articles' && (
              <ArticlesView
                papers={papers}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenArticle={(slug) => handleNavigate('article-detail', slug)}
                onOpenPdf={(paper) => setPdfViewerPaper(paper)}
                onOpenCite={(paper) => setCitationPaper(paper)}
              />
            )}

            {currentView === 'article-detail' && activeArticle && (
              <ArticleDetailView
                paper={activeArticle}
                onBack={() => handleNavigate('articles')}
                onOpenPdf={(paper) => setPdfViewerPaper(paper)}
                onOpenCite={(paper) => setCitationPaper(paper)}
              />
            )}

            {currentView === 'submit' && <SubmitManuscriptView />}

            {currentView === 'editorial-board' && <EditorialBoardView />}

            {currentView === 'admin' && (
              <AdminBackendView
                papers={papers}
                onRefreshPapers={fetchPapers}
                onOpenArticle={(slug) => handleNavigate('article-detail', slug)}
                onOpenPdf={(paper) => setPdfViewerPaper(paper)}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CitationModal paper={citationPaper} onClose={() => setCitationPaper(null)} />
      <PdfViewerModal paper={pdfViewerPaper} onClose={() => setPdfViewerPaper(null)} />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
