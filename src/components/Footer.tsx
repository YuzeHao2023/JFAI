import React from 'react';
import { BookOpen, ShieldCheck, Mail, Globe, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-700 flex items-center justify-center text-stone-100">
                <BookOpen className="w-4 h-4 text-amber-200" />
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight">JFAI</span>
            </div>
            <p className="text-stone-300 leading-relaxed text-[12px]">
              Journal of Financial Artificial Intelligence is a peer-reviewed, open-access scholarly publication focusing on retrieval-augmented systems, financial quantitative reasoning, and forensic transaction anomaly detection.
            </p>
            <div className="text-[11px] font-mono text-amber-400">
              ISSN: 2984-5120 (Online)
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-stone-200 font-semibold uppercase tracking-wider text-[11px]">Journal Navigation</h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition">
                  Journal Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('articles')} className="hover:text-amber-400 transition">
                  Current Issue (Vol. 1, No. 1)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('submit')} className="hover:text-amber-400 transition text-amber-300">
                  Manuscript Email Submission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('editorial-board')} className="hover:text-amber-400 transition">
                  Editorial Board & Ethics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Publication Ethics & Policy */}
          <div className="space-y-2.5">
            <h4 className="text-stone-200 font-semibold uppercase tracking-wider text-[11px]">Publication Ethics & Standards</h4>
            <p className="text-[12px] text-stone-300 leading-relaxed">
              JFAI strictly adheres to the ethical standards established by the Committee on Publication Ethics (COPE) for rigorous, unbiased scientific reporting.
            </p>
            <div className="text-[11px] text-stone-400 space-y-1 pt-1">
              <div>• Rigorous double-blind peer review</div>
              <div>• Open Access dissemination (CC BY 4.0)</div>
              <div>• CrossRef Digital Object Identifier: <span className="font-mono text-stone-300">10.59281/jfai</span></div>
            </div>
          </div>

          {/* Col 4: Editorial Office */}
          <div className="space-y-2.5">
            <h4 className="text-stone-200 font-semibold uppercase tracking-wider text-[11px]">Editorial Submissions</h4>
            <p className="text-[12px] text-stone-300">
              Authors submit manuscripts directly to the editorial office email with complete title, abstract, and PDF preprint.
            </p>
            <div className="pt-1">
              <a
                href="mailto:haoyuze2024@gmail.com?subject=[JFAI Manuscript Submission]"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-mono text-[11px] underline underline-offset-2"
              >
                <Mail className="w-3.5 h-3.5" /> haoyuze2024@gmail.com
              </a>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-[11px] text-stone-400 hover:text-amber-300 border border-stone-800 hover:border-amber-600 px-2 py-1 rounded transition"
              >
                Editor / Server Backend Access &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Journal of Financial Artificial Intelligence. Published under Creative Commons CC BY 4.0.
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Peer-Reviewed Quarterly Journal</span>
            <span>•</span>
            <span>Open Access Repository</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
