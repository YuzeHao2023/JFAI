import React, { useState } from 'react';
import {
  Mail,
  Send,
  FileCheck,
  Copy,
  Check,
  AlertCircle,
  Download,
  Clock,
  ShieldAlert,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const SubmitManuscriptView: React.FC = () => {
  const editorialEmail = 'haoyuze2024@gmail.com';

  const [authorName, setAuthorName] = useState('');
  const [authorAffiliation, setAuthorAffiliation] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const defaultTemplate = `Dear Editor-in-Chief,
Journal of Financial Artificial Intelligence (JFAI),

I am submitting our manuscript entitled:
"${manuscriptTitle || '[Insert Manuscript Title Here]'}"
for consideration as an original research article in the Journal of Financial Artificial Intelligence.

--- MANUSCRIPT SUMMARY ---
Title: ${manuscriptTitle || '[Insert Title]'}
Corresponding Author: ${authorName || '[Author Name]'}
Affiliation: ${authorAffiliation || '[Department & University/Institute]'}
Author Email: ${authorEmail || '[Email Address]'}

Abstract:
${abstract || '[Insert 200-300 word Abstract here]'}

Keywords:
${keywords || '[financial AI, RAG, symbolic reasoning, risk analysis]'}

--- ATTACHMENTS CHECKLIST ---
[X] 1. Complete PDF Manuscript with Figures and Tables
[X] 2. LaTeX Source / Word Document
[X] 3. Cover Letter and Statement of No Competing Interests

--- AUTHOR DECLARATION ---
1. This manuscript represents original work and is not under consideration elsewhere.
2. All co-authors have approved the submitted version.
3. No undisclosed conflicts of interest exist.

Sincerely,
${authorName || '[Your Name]'}
${authorAffiliation || '[Your Affiliation]'}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(defaultTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(
      `[JFAI Manuscript Submission] - ${manuscriptTitle || 'New Manuscript Submission'}`
    );
    const body = encodeURIComponent(defaultTemplate);
    window.location.href = `mailto:${editorialEmail}?subject=${subject}&body=${body}`;
  };

  const handleLogIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manuscriptTitle || !authorName) {
      alert('Please fill in at least the Title and Author Name.');
      return;
    }

    try {
      const res = await fetch('/api/submissions/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptTitle,
          correspondingAuthor: authorName,
          email: authorEmail,
          abstract,
          keywords,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionId(data.submissionId);
        setFormSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setSubmissionId(`JFAI-${Date.now().toString().slice(-6)}`);
      setFormSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-900 mb-3">
          <Mail className="w-3.5 h-3.5 text-amber-600" />
          <span>Official Submission Method: Direct Email Submission</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Manuscript Submission & Author Guidelines
        </h1>
        <p className="font-serif italic text-stone-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          The Journal of Financial Artificial Intelligence accepts submissions directly through our editorial email portal. We eliminate tedious submission portals to ensure direct, transparent communication between authors and the editorial board.
        </p>
      </div>

      {/* Main Email Submission CTA Box */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 rounded-xl p-6 sm:p-8 border border-stone-800 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
              Editorial Office Email
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide break-all">
              {editorialEmail}
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-serif">
              Send your PDF manuscript and source files with the subject line format: <br />
              <code className="text-amber-300 bg-stone-800 px-2 py-0.5 rounded text-[11px] font-mono">
                [JFAI Manuscript Submission] - &lt;Title&gt; - &lt;Corresponding Author&gt;
              </code>
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-2.5">
            <button
              onClick={handleOpenMailto}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Compose Email Now</span>
            </button>
            <button
              onClick={handleCopyTemplate}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 text-xs"
            >
              {copiedTemplate ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Template Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  <span>Copy Email Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Email Formulation & Assistant */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="border-b border-stone-200 pb-4 mb-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            Interactive Email Submission Formatter
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-serif italic">
            Enter your manuscript details below to auto-generate the submission template and launch your email client.
          </p>
        </div>

        {formSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-emerald-950 text-base">
                  Submission Details Generated (ID: {submissionId})
                </h3>
                <p className="text-xs text-emerald-800">
                  Your submission package has been formatted. Please click below to send the final email with your PDF attachment to <span className="font-mono font-semibold">{editorialEmail}</span>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleOpenMailto}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Email Client & Attach PDF</span>
              </button>
              <button
                onClick={handleCopyTemplate}
                className="bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 text-xs font-medium px-4 py-2 rounded flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-stone-600" />
                <span>Copy Generated Text</span>
              </button>
              <button
                onClick={() => setFormSubmitted(false)}
                className="text-xs text-stone-500 hover:text-stone-800 px-3 py-2"
              >
                Edit Details
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogIntent} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Corresponding Author Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Xiang Zhang"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Author Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. author@institution.edu"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Author Affiliation & Institute *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. College of Computer Science, Sichuan University"
                value={authorAffiliation}
                onChange={(e) => setAuthorAffiliation(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Manuscript Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adaptive Reasoning and Routing in Financial Retrieval-Augmented Generation"
                value={manuscriptTitle}
                onChange={(e) => setManuscriptTitle(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Abstract (200–300 words)
              </label>
              <textarea
                rows={4}
                placeholder="Paste your manuscript abstract here..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-serif leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Keywords (4–6 separated by commas)
              </label>
              <input
                type="text"
                placeholder="e.g. financial AI, adaptive routing, RAG, anomaly detection"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-500">
                * Attach your final PDF when sending the email to haoyuze2024@gmail.com
              </span>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs px-5 py-2.5 rounded shadow-xs transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Email Template & Prepare Submission</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Guidelines & Peer Review Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-3">
          <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-800">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-sm">
            1. Required Attachments
          </h3>
          <ul className="text-xs text-stone-600 space-y-1.5 font-serif">
            <li>• <strong>Main Manuscript (PDF)</strong>: complete with figures, equations, and references.</li>
            <li>• <strong>Source Files</strong>: LaTeX zip package or Microsoft Word (.docx).</li>
            <li>• <strong>Cover Letter</strong>: brief statement of motivation and originality.</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-3">
          <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-sm">
            2. Rapid Peer Review
          </h3>
          <ul className="text-xs text-stone-600 space-y-1.5 font-serif">
            <li>• <strong>Desk Review</strong>: within 48 hours of email receipt.</li>
            <li>• <strong>Reviewer Allocation</strong>: 2 independent expert referees.</li>
            <li>• <strong>First Decision</strong>: typically within 3–4 weeks.</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-3">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-800">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-sm">
            3. Open Access & Indexing
          </h3>
          <ul className="text-xs text-stone-600 space-y-1.5 font-serif">
            <li>• <strong>Open Access</strong>: published under CC BY 4.0 license.</li>
            <li>• <strong>Academic Indexing</strong>: immediate discovery and bibliographic harvesting.</li>
            <li>• <strong>Zero APC</strong>: No Article Processing Charges for Vol. 1.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
