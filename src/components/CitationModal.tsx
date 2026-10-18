import React, { useState } from 'react';
import { X, Copy, Check, Download, Quote } from 'lucide-react';
import { Paper } from '../types';
import {
  generateApa,
  generateMla,
  generateChicago,
  generateBibtex,
  generateRis,
} from '../utils/academic';

interface CitationModalProps {
  paper: Paper | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ paper, onClose }) => {
  const [activeTab, setActiveTab] = useState<'APA' | 'MLA' | 'Chicago' | 'BibTeX' | 'RIS'>('BibTeX');
  const [copied, setCopied] = useState(false);

  if (!paper) return null;

  const getCitationText = () => {
    switch (activeTab) {
      case 'APA':
        return generateApa(paper);
      case 'MLA':
        return generateMla(paper);
      case 'Chicago':
        return generateChicago(paper);
      case 'BibTeX':
        return generateBibtex(paper);
      case 'RIS':
        return generateRis(paper);
      default:
        return '';
    }
  };

  const currentText = getCitationText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'BibTeX' ? 'bib' : activeTab === 'RIS' ? 'ris' : 'txt';
    const mime = activeTab === 'BibTeX' ? 'application/x-bibtex' : 'text/plain';
    const blob = new Blob([currentText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.slug}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-lg">Cite This Article</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs text-stone-500 mb-3 truncate">
            {paper.title}
          </p>

          {/* Format Tabs */}
          <div className="flex border-b border-stone-200 gap-1 mb-4 text-xs font-medium">
            {(['BibTeX', 'RIS', 'APA', 'MLA', 'Chicago'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  setActiveTab(fmt);
                  setCopied(false);
                }}
                className={`px-3 py-2 border-b-2 transition ${
                  activeTab === fmt
                    ? 'border-amber-600 text-amber-900 font-semibold bg-amber-50/50'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="relative">
            <pre className="p-4 bg-stone-50 border border-stone-200 rounded text-xs font-mono text-stone-800 whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-y-auto">
              {currentText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-stone-100">
            <span className="text-[11px] text-stone-400 font-serif italic">
              Compatible with Zotero, Mendeley, EndNote & LaTeX
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs text-stone-700 hover:text-stone-900 border border-stone-300 rounded hover:bg-stone-50 transition flex items-center gap-1.5 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .{activeTab === 'BibTeX' ? 'bib' : activeTab === 'RIS' ? 'ris' : 'txt'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-600 text-white rounded transition flex items-center gap-1.5 font-medium shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Citation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
