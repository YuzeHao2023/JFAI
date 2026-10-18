import React, { useState } from 'react';
import { X, Download, ExternalLink, Maximize2, Minimize2, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Paper } from '../types';

interface PdfViewerModalProps {
  paper: Paper | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ paper, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!paper) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs transition-all ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div
        className={`bg-stone-900 rounded-lg shadow-2xl flex flex-col border border-stone-800 overflow-hidden w-full transition-all duration-200 ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-5xl h-[92vh]'
        }`}
      >
        {/* Toolbar */}
        <div className="bg-stone-950 px-4 py-2.5 flex items-center justify-between border-b border-stone-800 text-stone-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-7 h-7 rounded bg-amber-700/80 flex items-center justify-center text-amber-200 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-serif font-medium truncate text-white">{paper.title}</div>
              <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                <span>{paper.pdfFileName}</span>
                <span>•</span>
                <span>DOI: {paper.doi}</span>
                {paper.pdfSize && (
                  <>
                    <span>•</span>
                    <span>{paper.pdfSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={paper.pdfUrl}
              download={paper.pdfFileName}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded transition"
              title="Open raw PDF in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded transition hidden sm:inline-flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-stone-800 relative">
          <iframe
            src={`${paper.pdfUrl}#toolbar=1&view=FitH`}
            title={`PDF Preview: ${paper.title}`}
            className="w-full h-full border-none bg-stone-100"
          />
        </div>
      </div>
    </div>
  );
};
