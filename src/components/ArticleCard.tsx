import React from 'react';
import { Download, Eye, FileText, Quote, ArrowRight, ShieldCheck } from 'lucide-react';
import { Paper } from '../types';

interface ArticleCardProps {
  paper: Paper;
  onOpenArticle: (slug: string) => void;
  onOpenPdf: (paper: Paper) => void;
  onOpenCite: (paper: Paper) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  paper,
  onOpenArticle,
  onOpenPdf,
  onOpenCite,
}) => {
  return (
    <article className="bg-white border border-stone-200/90 rounded-lg p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-200 group flex flex-col justify-between">
      <div>
        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
              {paper.articleType || 'Research Article'}
            </span>
            <span className="text-stone-500 font-mono text-[11px]">
              Vol. {paper.volume}, Iss. {paper.issue} ({paper.publishedDate.split('-')[0]})
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 text-[11px]">pp. {paper.firstPage}–{paper.lastPage}</span>
          </div>
          <span className="text-stone-600 font-medium text-[11px] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            Open Access
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenArticle(paper.slug)}
          className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition cursor-pointer leading-snug mb-2"
        >
          {paper.title}
        </h3>

        {/* Subtitle if any */}
        {paper.subtitle && (
          <p className="text-xs font-serif italic text-stone-600 mb-2.5 leading-relaxed">
            {paper.subtitle}
          </p>
        )}

        {/* Authors */}
        <div className="text-xs text-stone-700 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          {paper.authors.map((author, idx) => (
            <span key={idx} className="font-medium text-stone-900">
              {author.name}
              {author.isCorresponding && <sup className="text-amber-700 ml-0.5 font-bold">*</sup>}
              {idx < paper.authors.length - 1 && <span className="text-stone-400 font-normal">,</span>}
            </span>
          ))}
          <span className="text-stone-400 text-[11px]">
            ({paper.authors[0]?.affiliation})
          </span>
        </div>

        {/* Abstract snippet */}
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4 font-serif">
          {paper.abstract}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {paper.keywords.slice(0, 5).map((kw, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200/60"
            >
              {kw}
            </span>
          ))}
          {paper.keywords.length > 5 && (
            <span className="text-[11px] text-stone-400 self-center">
              +{paper.keywords.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-stone-500 font-mono text-[11px]">
          <span>DOI: <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="text-stone-700 hover:text-amber-700 underline">{paper.doi}</a></span>
          {paper.metrics && (
            <span className="hidden sm:inline-flex items-center gap-2 text-stone-400">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {paper.metrics.views}</span>
              <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> {paper.metrics.downloads}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCite(paper)}
            className="px-2.5 py-1 text-stone-700 hover:text-stone-900 border border-stone-300 rounded hover:bg-stone-50 transition flex items-center gap-1 font-medium text-[11px]"
            title="Export citation"
          >
            <Quote className="w-3 h-3" />
            <span>Cite</span>
          </button>

          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            download={paper.pdfFileName}
            className="px-2.5 py-1 text-stone-700 hover:text-stone-900 border border-stone-300 rounded hover:bg-stone-50 transition flex items-center gap-1 font-medium text-[11px]"
            title="Download PDF directly from /pdf"
          >
            <Download className="w-3 h-3 text-amber-700" />
            <span>PDF ({paper.pdfSize || 'Direct'})</span>
          </a>

          <button
            onClick={() => onOpenArticle(paper.slug)}
            className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded font-medium transition flex items-center gap-1 text-[11px] shadow-2xs"
          >
            <span>Read Article</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
