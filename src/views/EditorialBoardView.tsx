import React from 'react';
import { BookOpen, Mail, ShieldCheck, Award, CheckCircle, Globe } from 'lucide-react';

export const EditorialBoardView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Editorial Board & Journal Scope
        </h1>
        <p className="font-serif italic text-stone-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          The Journal of Financial Artificial Intelligence (JFAI) is dedicated to advancing the frontier of intelligent computational systems, multi-hop evidence reasoning, and auditable financial forensics.
        </p>
      </div>

      {/* Aims and Scope */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-2">
          Aims & Scientific Scope
        </h2>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif">
          JFAI publishes high-quality original research articles, methodology frameworks, and systematic surveys covering the intersection of artificial intelligence and modern finance. Key topic areas include, but are not limited to:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
          <div className="bg-stone-50 p-3 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-amber-900 block">Retrieval-Augmented Financial Systems (RAG)</span>
            <p className="text-stone-500">Multi-hop dense retrieval, context fusion, tabular-textual reasoning, and regulatory disclosure synthesis.</p>
          </div>
          <div className="bg-stone-50 p-3 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-amber-900 block">Blockchain & Transaction Forensics</span>
            <p className="text-stone-500">Temporal anomaly detection, graph neural networks, anti-money laundering (AML), and smart contract verification.</p>
          </div>
          <div className="bg-stone-50 p-3 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-amber-900 block">Symbolic Quantitative Reasoning</span>
            <p className="text-stone-500">Hybrid neuro-symbolic computation, executable mathematical programs, and deterministic calculation audits.</p>
          </div>
          <div className="bg-stone-50 p-3 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-amber-900 block">Selective Prediction & Risk Triage</span>
            <p className="text-stone-500">Cost-aware routing, calibrated abstention, and human-in-the-loop analyst decision support.</p>
          </div>
        </div>
      </div>

      {/* Editorial Team */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-2">
          Editorial Leadership
        </h2>

        <div className="space-y-6">
          {/* Editor-in-Chief */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-5">
            <div className="text-[11px] font-mono uppercase text-amber-800 font-semibold tracking-wider">
              Editor-in-Chief
            </div>
            <div className="font-serif font-bold text-stone-950 text-base sm:text-lg mt-1">
              Prof. Xiang Zhang, Ph.D.
            </div>
            <div className="text-xs text-stone-600 font-serif mt-0.5">
              College of Computer Science, Sichuan University, Chengdu, China
            </div>
            <div className="text-xs text-stone-500 mt-2">
              <strong>Research Focus:</strong> Financial Large Language Models, Multi-Hop RAG, Adaptive Routing, and Anomaly Detection in Transaction Sequences.
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <a
                href="mailto:haoyuze2024@gmail.com?subject=[JFAI Editorial Query]"
                className="text-amber-800 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <Mail className="w-3.5 h-3.5" /> haoyuze2024@gmail.com
              </a>
              <span className="text-stone-300">|</span>
              <span className="font-mono text-stone-500 text-[11px]">ORCID: 0009-0004-8192-3810</span>
            </div>
          </div>

          {/* Associate Editors */}
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm mb-3 uppercase tracking-wider">
              Associate Editors & Editorial Advisory Board
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-stone-200 rounded p-3">
                <div className="font-semibold text-stone-900">Dr. C. Zhao</div>
                <div className="text-stone-500 font-serif">Department of Financial Engineering & Data Science</div>
                <div className="text-[11px] text-stone-400 mt-1">Specialty: Blockchain Analytics & Temporal Graph Networks</div>
              </div>
              <div className="border border-stone-200 rounded p-3">
                <div className="font-semibold text-stone-900">Dr. F. Sun</div>
                <div className="text-stone-500 font-serif">Institute of Applied Artificial Intelligence</div>
                <div className="text-[11px] text-stone-400 mt-1">Specialty: Knowledge-Intensive NLP & Dense Passage Retrieval</div>
              </div>
              <div className="border border-stone-200 rounded p-3">
                <div className="font-semibold text-stone-900">Dr. Z. Wang</div>
                <div className="text-stone-500 font-serif">Center for Quantitative Risk & Actuarial Computing</div>
                <div className="text-[11px] text-stone-400 mt-1">Specialty: Neuro-Symbolic Reasoning & Multi-Step Math</div>
              </div>
              <div className="border border-stone-200 rounded p-3">
                <div className="font-semibold text-stone-900">Dr. K. Tong</div>
                <div className="text-stone-500 font-serif">Laboratory of Financial Forensics & Computational Law</div>
                <div className="text-[11px] text-stone-400 mt-1">Specialty: Auditable Claim Verification & Decision Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Peer Review & Open Access Policy */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-2">
          Peer-Review Integrity & Open Access Policy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-900 block">Double-Blind Peer Review</span>
            <p className="text-stone-600 font-serif">
              All submissions undergo rigorous double-blind evaluation by at least two independent subject experts.
            </p>
          </div>
          <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-900 block">Open Access CC BY 4.0</span>
            <p className="text-stone-600 font-serif">
              Authors retain copyright. Articles are free to read, download, redistribute, and mine with proper attribution.
            </p>
          </div>
          <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-900 block">No APCs (Zero Author Fee)</span>
            <p className="text-stone-600 font-serif">
              Volume 1 is sponsored by academic endowment. No article processing or submission fees are charged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
