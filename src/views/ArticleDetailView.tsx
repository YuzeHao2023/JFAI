import React, { useState, useEffect } from 'react';
import {
  Download,
  Quote,
  ShieldCheck,
  FileText,
  Mail,
  ExternalLink,
  Share2,
  Calendar,
  Check,
  Copy,
  Layers,
  Table,
  BookMarked,
  ArrowLeft,
  Eye,
  Hash,
} from 'lucide-react';
import { Paper } from '../types';

interface ArticleDetailViewProps {
  paper: Paper;
  onBack: () => void;
  onOpenPdf: (paper: Paper) => void;
  onOpenCite: (paper: Paper) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  paper,
  onBack,
  onOpenPdf,
  onOpenCite,
}) => {
  const [activeTab, setActiveTab] = useState<'abstract' | 'fulltext' | 'figures' | 'references'>('abstract');
  const [copiedDoi, setCopiedDoi] = useState(false);

  // Trigger metrics view increment on mount
  useEffect(() => {
    fetch(`/api/metrics/${paper.slug}/view`, { method: 'POST' }).catch(() => {});
  }, [paper.slug]);

  const handleCopyDoi = () => {
    navigator.clipboard.writeText(`https://doi.org/${paper.doi}`);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-700 hover:text-amber-800 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Articles</span>
        </button>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>JFAI</span>
          <span>&gt;</span>
          <span>Vol. {paper.volume}, Iss. {paper.issue}</span>
          <span>&gt;</span>
          <span className="text-stone-900 font-semibold">{paper.slug}</span>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
        {/* Article Meta Banner */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-amber-900 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
              {paper.articleType}
            </span>
            <span className="text-stone-600 font-mono text-[11px]">
              {paper.journalTitle} • Vol. {paper.volume}, No. {paper.issue} (2026)
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600 text-[11px]">pp. {paper.firstPage}–{paper.lastPage}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-[11px]">Open Access (CC BY 4.0)</span>
          </div>
        </div>

        {/* Article Header Section */}
        <div className="p-6 sm:p-8 border-b border-stone-200">
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 leading-tight mb-3">
            {paper.title}
          </h1>

          {paper.subtitle && (
            <h2 className="font-serif italic text-base sm:text-lg text-stone-600 mb-5 leading-relaxed">
              {paper.subtitle}
            </h2>
          )}

          {/* Authors List */}
          <div className="space-y-2 mb-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-900 font-medium">
              {paper.authors.map((author, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="font-serif text-base">{author.name}</span>
                  {author.isCorresponding && (
                    <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                      Corresponding Author
                    </span>
                  )}
                  {author.email && (
                    <a
                      href={`mailto:${author.email}`}
                      className="text-stone-400 hover:text-amber-700 p-0.5"
                      title={`Email: ${author.email}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Affiliations */}
            <div className="text-xs text-stone-500 font-serif space-y-0.5">
              {paper.authors.map((author, idx) => (
                <div key={idx}>
                  {author.affiliation}
                  {author.orcid && (
                    <span className="ml-2 font-mono text-[10px] text-emerald-700">
                      ORCID: {author.orcid}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DOI and Dates */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-4 border-t border-stone-100">
            <div className="flex items-center gap-4 text-stone-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Published: <strong>{paper.publishedDate}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Hash className="w-3.5 h-3.5 text-stone-400" />
                <span>DOI: <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="text-stone-800 underline hover:text-amber-700">{paper.doi}</a></span>
                <button
                  onClick={handleCopyDoi}
                  className="text-stone-400 hover:text-stone-700 p-1"
                  title="Copy DOI URL"
                >
                  {copiedDoi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
            </div>

            {paper.metrics && (
              <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {paper.metrics.views} Views</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {paper.metrics.downloads} Downloads</span>
                <span className="flex items-center gap-1"><Quote className="w-3.5 h-3.5" /> {paper.metrics.citations} Citations</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-stone-100 px-6 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={paper.pdfUrl}
              download={paper.pdfFileName}
              onClick={() => {
                fetch(`/api/metrics/${paper.slug}/download`, { method: 'POST' }).catch(() => {});
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium px-4 py-2 rounded shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF ({paper.pdfSize || 'Direct'})</span>
            </a>

            <button
              onClick={() => onOpenPdf(paper)}
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-medium px-3.5 py-2 rounded transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-stone-600" />
              <span>In-App PDF Reader</span>
            </button>

            <button
              onClick={() => onOpenCite(paper)}
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-medium px-3.5 py-2 rounded transition flex items-center gap-1.5"
            >
              <Quote className="w-4 h-4 text-stone-600" />
              <span>Cite (BibTeX, RIS, APA)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-6 gap-2 bg-stone-50/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('abstract')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'abstract'
                ? 'border-amber-700 text-amber-900 font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Abstract & Keywords
          </button>
          <button
            onClick={() => setActiveTab('fulltext')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'fulltext'
                ? 'border-amber-700 text-amber-900 font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Full Text & Sections
          </button>
          <button
            onClick={() => setActiveTab('figures')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'figures'
                ? 'border-amber-700 text-amber-900 font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Tables & Architecture
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'references'
                ? 'border-amber-700 text-amber-900 font-semibold bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            References ({paper.references?.length || 0})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8">
          {/* Abstract Tab */}
          {activeTab === 'abstract' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base mb-3 uppercase tracking-wider text-xs">
                  Abstract
                </h3>
                <p className="font-serif text-sm sm:text-base text-stone-800 leading-relaxed text-justify">
                  {paper.abstract}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* PDF Preview Box */}
              <div className="pt-6 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    Full-Text PDF Document ({paper.pdfFileName})
                  </h4>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Open in new window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="h-96 w-full rounded border border-stone-300 overflow-hidden bg-stone-100">
                  <iframe
                    src={`${paper.pdfUrl}#toolbar=0&view=FitH`}
                    title="PDF Preview"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Text Sections */}
          {activeTab === 'fulltext' && (
            <div className="space-y-8 max-w-4xl font-serif">
              {paper.sections && paper.sections.length > 0 ? (
                paper.sections.map((sec) => (
                  <section key={sec.id} className="space-y-3">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 border-b border-stone-100 pb-1.5">
                      {sec.title}
                    </h3>
                    {sec.content.map((p, idx) => (
                      <p key={idx} className="text-sm sm:text-base text-stone-800 leading-relaxed text-justify">
                        {p}
                      </p>
                    ))}
                  </section>
                ))
              ) : (
                <div className="text-stone-500 text-sm">
                  Please consult the full PDF document for comprehensive mathematical formulas and empirical analyses.
                </div>
              )}
            </div>
          )}

          {/* Figures & Architecture Tab */}
          {activeTab === 'figures' && (
            <div className="space-y-8 max-w-4xl">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
                <h4 className="font-serif font-bold text-stone-900 text-sm mb-2">
                  System Architecture Overview
                </h4>
                <div className="bg-white p-4 rounded border border-stone-200 font-mono text-xs text-stone-700 leading-relaxed overflow-x-auto">
                  <div className="text-amber-800 font-semibold mb-2">
                    [Task Query (q, x)] &rarr; [Task Profiler &psi;(q, x)]
                  </div>
                  <div className="pl-4 space-y-1 text-stone-600">
                    <div>├─ Direct Lookup (r0) : Low latency fact retrieval</div>
                    <div>├─ Multi-Hop Document RAG (r1) : Dense retrieval + iterative context fusion</div>
                    <div>├─ Symbolic Quantitative Reasoner (r2) : Deterministic executable expression parser</div>
                    <div>├─ Temporal Transaction Risk (r3) : Gated attention feature/time sequential scoring</div>
                    <div>└─ Quality-Cost Gate : V(r|q, z_t) = &Delta;U - &lambda;_c &Delta;C - &lambda;_h &Delta;H</div>
                  </div>
                  <div className="text-emerald-800 font-semibold mt-2">
                    &rarr; Output: Research Memo with Typed Evidence Ledger or Escalation to Analyst Review
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-2 font-serif italic">
                  Figure: Modular pipeline linking evidence sources and stopping criteria.
                </p>
              </div>

              {/* Route Library Table */}
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 font-serif font-bold text-xs text-stone-800">
                  Table: Route Library and Intended Activation Conditions
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200 text-xs">
                    <thead className="bg-stone-50 font-semibold text-stone-700 text-left">
                      <tr>
                        <th className="px-4 py-2.5">Route</th>
                        <th className="px-4 py-2.5">Typical Trigger</th>
                        <th className="px-4 py-2.5">Output</th>
                        <th className="px-4 py-2.5">Cost Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      <tr>
                        <td className="px-4 py-2 font-medium">Direct Lookup</td>
                        <td className="px-4 py-2">One fact, known source, low ambiguity</td>
                        <td className="px-4 py-2">Source-linked fact or clarification</td>
                        <td className="px-4 py-2 font-mono text-emerald-700">Low</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Multi-hop Doc QA</td>
                        <td className="px-4 py-2">Cross-section or cross-document synthesis</td>
                        <td className="px-4 py-2">Answer with retrieved passages & hop trace</td>
                        <td className="px-4 py-2 font-mono text-amber-700">Medium to high</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Symbolic Quantitative</td>
                        <td className="px-4 py-2">Arithmetic, comparison, unit conversion</td>
                        <td className="px-4 py-2">Executable expression & validated value</td>
                        <td className="px-4 py-2 font-mono text-blue-700">Low to medium</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Temporal Risk</td>
                        <td className="px-4 py-2">Ordered transaction or event sequence</td>
                        <td className="px-4 py-2">Risk score & salient temporal window</td>
                        <td className="px-4 py-2 font-mono text-amber-700">Medium to high</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium text-purple-800">Analyst Escalation</td>
                        <td className="px-4 py-2">Conflicting sources or high-impact uncertainty</td>
                        <td className="px-4 py-2">Human decision or additional evidence</td>
                        <td className="px-4 py-2 font-mono text-purple-700">Human-time dependent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* References Tab */}
          {activeTab === 'references' && (
            <div className="space-y-4 max-w-4xl font-serif">
              <h3 className="font-serif font-bold text-stone-900 text-sm uppercase tracking-wider mb-2">
                References
              </h3>
              <ol className="list-decimal pl-5 space-y-2.5 text-xs text-stone-800 leading-relaxed">
                {paper.references?.map((ref, i) => (
                  <li key={i} className="pl-1">
                    <span>{ref}</span>
                    <a
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(ref)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-amber-800 hover:underline inline-flex items-center gap-0.5 text-[11px] font-sans"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Scholar</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
