import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Download, FileText, ArrowUpDown } from 'lucide-react';
import { Paper } from '../types';
import { ArticleCard } from '../components/ArticleCard';

interface ArticlesViewProps {
  papers: Paper[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenArticle: (slug: string) => void;
  onOpenPdf: (paper: Paper) => void;
  onOpenCite: (paper: Paper) => void;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({
  papers,
  searchQuery,
  onSearchChange,
  onOpenArticle,
  onOpenPdf,
  onOpenCite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'date'>('default');

  const categories = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [papers]);

  const filteredPapers = useMemo(() => {
    let result = papers.filter((paper) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        paper.title.toLowerCase().includes(q) ||
        (paper.subtitle && paper.subtitle.toLowerCase().includes(q)) ||
        paper.abstract.toLowerCase().includes(q) ||
        paper.doi.toLowerCase().includes(q) ||
        paper.authors.some((a) => a.name.toLowerCase().includes(q) || a.affiliation.toLowerCase().includes(q)) ||
        paper.keywords.some((k) => k.toLowerCase().includes(q));

      const matchCategory = selectedCategory === 'All' || paper.category === selectedCategory;

      return matchSearch && matchCategory;
    });

    if (sortBy === 'views') {
      result = [...result].sort((a, b) => ((b.metrics?.views || 0) - (a.metrics?.views || 0)));
    } else if (sortBy === 'date') {
      result = [...result].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    }

    return result;
  }, [papers, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Table of Contents — Volume 1, Issue 1 (2026)
            </h1>
            <p className="text-sm font-serif italic text-stone-600 mt-1">
              Peer-reviewed open-access articles. All papers include full-text PDFs hosted on the server /pdf folder.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-stone-100 border border-stone-200 px-3 py-1.5 rounded">
            <span>Issue DOI:</span>
            <span className="text-amber-800 font-semibold">10.59281/jfai.2026.1.1</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Filter by keyword, author, DOI..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-300 rounded pl-8 pr-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Categories & Sorting */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-amber-600"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Subjects' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-amber-600"
            >
              <option value="default">Pagination Order</option>
              <option value="views">Most Viewed</option>
              <option value="date">Publication Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
        <span>Showing {filteredPapers.length} of {papers.length} articles</span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-amber-800 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Articles List */}
      <div className="space-y-5">
        {filteredPapers.map((paper) => (
          <ArticleCard
            key={paper.id}
            paper={paper}
            onOpenArticle={onOpenArticle}
            onOpenPdf={onOpenPdf}
            onOpenCite={onOpenCite}
          />
        ))}

        {filteredPapers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-stone-300">
            <FileText className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-serif text-stone-700 font-semibold text-sm">No articles match your query</h3>
            <p className="text-xs text-stone-500 mt-1">Try modifying your search keywords or resetting filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
