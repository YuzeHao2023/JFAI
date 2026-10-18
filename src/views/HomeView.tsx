import React from 'react';
import {
  BookOpen,
  Send,
  ShieldCheck,
  Download,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Quote,
  Eye,
  Layers,
} from 'lucide-react';
import { Paper } from '../types';
import { ArticleCard } from '../components/ArticleCard';

interface HomeViewProps {
  papers: Paper[];
  onNavigate: (view: string, slug?: string) => void;
  onOpenArticle: (slug: string) => void;
  onOpenPdf: (paper: Paper) => void;
  onOpenCite: (paper: Paper) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  papers,
  onNavigate,
  onOpenArticle,
  onOpenPdf,
  onOpenCite,
}) => {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-stone-100 py-12 sm:py-16 px-4 sm:px-6 border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs px-2.5 py-1 rounded">
                Vol. 1, Issue 1 (2026) Published
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Open Access (CC BY 4.0)
              </span>
              <span className="text-stone-400 text-xs">ISSN: 2984-5120</span>
            </div>

            {/* Masthead Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Journal of Financial Artificial Intelligence
            </h1>

            <p className="font-serif italic text-base sm:text-lg text-stone-300 mb-6 leading-relaxed">
              An international peer-reviewed, open-access journal publishing rigorous research on adaptive RAG, symbolic reasoning, blockchain forensics, and computational economics.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('articles')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-2.5 rounded shadow transition flex items-center gap-2 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse Current Issue ({papers.length} Articles)</span>
              </button>
              <button
                onClick={() => onNavigate('submit')}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-stone-500 font-medium px-5 py-2.5 rounded transition flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>Submit Manuscript via Email</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column: Latest Articles (8 cols) */}
          <main className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-300">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Current Issue — Vol. 1, No. 1 (2026)
                </h2>
                <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                  Full-text open-access articles with direct PDF downloads from /pdf/
                </p>
              </div>
              <button
                onClick={() => onNavigate('articles')}
                className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* List of Articles */}
            <div className="space-y-4">
              {papers.map((paper) => (
                <ArticleCard
                  key={paper.id}
                  paper={paper}
                  onOpenArticle={onOpenArticle}
                  onOpenPdf={onOpenPdf}
                  onOpenCite={onOpenCite}
                />
              ))}
            </div>

            {/* Call for Papers Banner */}
            <div className="bg-gradient-to-br from-amber-50 to-stone-100 border border-amber-200/80 rounded-lg p-6 mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-mono uppercase tracking-wider rounded">
                      Open Call
                    </span>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Call for Papers: Volume 1, Issue 2
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                    We welcome novel contributions on AI agents for finance, multi-hop financial QA, cryptocurrency anomaly detection, and symbolic-neural verification. All submissions are conducted via email.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('submit')}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium px-4 py-2 rounded shrink-0 shadow-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Email Manuscript</span>
                </button>
              </div>
            </div>
          </main>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Journal Metrics Box */}
            <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
              <h3 className="font-serif font-bold text-stone-900 text-sm uppercase tracking-wide border-b border-stone-100 pb-2 mb-3">
                Journal Overview & Metrics
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-50 p-2.5 rounded border border-stone-100">
                  <dt className="text-stone-500 text-[11px]">ISSN (Online)</dt>
                  <dd className="font-mono font-semibold text-stone-900 mt-0.5">2984-5120</dd>
                </div>
                <div className="bg-stone-50 p-2.5 rounded border border-stone-100">
                  <dt className="text-stone-500 text-[11px]">Frequency</dt>
                  <dd className="font-semibold text-stone-900 mt-0.5">Quarterly</dd>
                </div>
                <div className="bg-stone-50 p-2.5 rounded border border-stone-100">
                  <dt className="text-stone-500 text-[11px]">First Decision</dt>
                  <dd className="font-semibold text-emerald-700 mt-0.5">3-4 Weeks</dd>
                </div>
                <div className="bg-stone-50 p-2.5 rounded border border-stone-100">
                  <dt className="text-stone-500 text-[11px]">Article Processing</dt>
                  <dd className="font-semibold text-emerald-700 mt-0.5">No Fee (Free OA)</dd>
                </div>
              </dl>
              <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center gap-1 text-stone-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Double-blind rigorous peer review</span>
                </div>
                <div className="flex items-center gap-1 text-stone-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Full-text open-access archive</span>
                </div>
                <div className="flex items-center gap-1 text-stone-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Persistent CrossRef DOI assignment</span>
                </div>
              </div>
            </div>

            {/* Email Submission Box */}
            <div className="bg-stone-900 text-stone-100 border border-stone-800 rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Send className="w-4 h-4" />
                <h3 className="font-serif font-bold text-sm">Submission via Email</h3>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                To submit, please email your PDF manuscript along with abstract and keywords directly to the Editor-in-Chief.
              </p>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800 mb-3 text-xs">
                <div className="text-[10px] text-stone-400 uppercase font-mono">Editorial Office:</div>
                <a
                  href="mailto:haoyuze2024@gmail.com?subject=[JFAI Manuscript Submission]"
                  className="font-mono text-amber-300 hover:underline break-all block mt-0.5"
                >
                  haoyuze2024@gmail.com
                </a>
              </div>
              <button
                onClick={() => onNavigate('submit')}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium py-2 rounded transition flex items-center justify-center gap-1.5"
              >
                <span>Read Submission Instructions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Server Backend Quick Link */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-stone-600" />
                  <span>Editor Backend</span>
                </span>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-amber-800 hover:underline font-mono text-[11px]"
                >
                  Manage /pdf &rarr;
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Authorized editors can upload new PDFs to the server /pdf folder and create article landing pages.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
