import React, { useState } from 'react';
import { BookOpen, Send, ShieldCheck, Database, Search, FileText, Menu, X, ExternalLink, BookmarkCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm">

      {/* Main Masthead / Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex items-center gap-3.5 group select-none"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-stone-100 shadow-inner border border-amber-500/30 group-hover:from-amber-500 group-hover:to-amber-700 transition">
              <BookOpen className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition">
                  JFAI
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Open Access
                </span>
              </div>
              <p className="text-xs text-stone-300 font-serif italic hidden sm:block">
                Journal of Financial Artificial Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded transition ${
                currentView === 'home'
                  ? 'bg-stone-800 text-amber-300 font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('articles')}
              className={`px-3 py-1.5 rounded transition ${
                currentView === 'articles' || currentView === 'article-detail'
                  ? 'bg-stone-800 text-amber-300 font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              Current Issue
            </button>
            <button
              onClick={() => onNavigate('submit')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                currentView === 'submit'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Submission</span>
            </button>
            <button
              onClick={() => onNavigate('editorial-board')}
              className={`px-3 py-1.5 rounded transition ${
                currentView === 'editorial-board'
                  ? 'bg-stone-800 text-amber-300 font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              Editorial Board
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 text-xs font-mono border ${
                currentView === 'admin'
                  ? 'bg-stone-800 border-amber-500 text-amber-300'
                  : 'border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Server /pdf Backend</span>
            </button>
          </nav>

          {/* Quick Search & Submit CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles, DOIs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  if (currentView !== 'articles') onNavigate('articles');
                }}
                className="w-44 focus:w-56 transition-all text-xs bg-stone-800 border border-stone-700 rounded-md pl-8 pr-3 py-1.5 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={() => onNavigate('submit')}
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-3.5 py-1.5 rounded shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Submit Manuscript</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => onNavigate('submit')}
              className="bg-amber-600 text-white text-xs px-2.5 py-1.5 rounded flex items-center gap-1 sm:hidden"
            >
              <Send className="w-3 h-3" />
              <span>Submit</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-stone-300 hover:text-white hover:bg-stone-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-stone-800 mt-3 space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-stone-200 hover:bg-stone-800 text-sm"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('articles');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-stone-200 hover:bg-stone-800 text-sm"
            >
              Current Issue & Articles
            </button>
            <button
              onClick={() => {
                onNavigate('submit');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-amber-300 font-medium hover:bg-stone-800 text-sm flex items-center justify-between"
            >
              <span>Email Submission Guidelines</span>
              <Send className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => {
                onNavigate('editorial-board');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-stone-200 hover:bg-stone-800 text-sm"
            >
              Editorial Board & Scope
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-stone-300 hover:bg-stone-800 text-sm font-mono flex items-center justify-between border-t border-stone-800/80 mt-1 pt-2"
            >
              <span>Server /pdf Backend (Editor Portal)</span>
              <Database className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
