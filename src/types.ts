export interface Author {
  name: string;
  affiliation: string;
  email: string;
  isCorresponding?: boolean;
  orcid?: string;
}

export interface PaperSection {
  id: string;
  title: string;
  content: string[];
}

export interface Paper {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  journalTitle: string;
  issn: string;
  volume: number;
  issue: number;
  firstPage: number;
  lastPage: number;
  publishedDate: string; // YYYY-MM-DD
  doi: string;
  category: string;
  articleType: string;
  license: string;
  authors: Author[];
  abstract: string;
  keywords: string[];
  pdfFileName: string;
  pdfUrl: string;
  pdfSize?: string;
  status: 'published' | 'in_press' | 'under_review';
  metrics?: {
    views: number;
    downloads: number;
    citations: number;
  };
  sections?: PaperSection[];
  references?: string[];
}

export interface PdfFileInfo {
  fileName: string;
  url: string;
  size: string;
  sizeBytes?: number;
  modified: string;
  isReferenced?: boolean;
}
