import { Paper } from '../types';

export function formatAuthorsShort(paper: Paper): string {
  if (!paper.authors || paper.authors.length === 0) return 'Anonymous';
  if (paper.authors.length === 1) return paper.authors[0].name;
  if (paper.authors.length === 2) return `${paper.authors[0].name} & ${paper.authors[1].name}`;
  return `${paper.authors[0].name} et al.`;
}

export function generateBibtex(paper: Paper): string {
  const authorStr = (paper.authors || []).map((a) => a.name).join(' and ');
  const year = paper.publishedDate ? paper.publishedDate.split('-')[0] : '2026';
  const citeKey = `${(paper.authors?.[0]?.name?.split(' ').pop() || 'author').toLowerCase()}${year}${paper.slug.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`;

  return `@article{${citeKey},
  title={{${paper.title}}},
  author={${authorStr}},
  journal={${paper.journalTitle || 'Journal of Financial Artificial Intelligence'}},
  volume={${paper.volume || 1}},
  number={${paper.issue || 1}},
  pages={${paper.firstPage || 1}--${paper.lastPage || 10}},
  year={${year}},
  doi={${paper.doi}},
  url={${window.location.origin}/article/${paper.slug}},
  publisher={JFAI Editorial Publishing Group}
}`;
}

export function generateRis(paper: Paper): string {
  const year = paper.publishedDate ? paper.publishedDate.split('-')[0] : '2026';
  const lines = [
    'TY  - JOUR',
    `TI  - ${paper.title}`,
    ...(paper.authors || []).map((a) => `AU  - ${a.name}`),
    `JO  - ${paper.journalTitle || 'Journal of Financial Artificial Intelligence'}`,
    `VL  - ${paper.volume || 1}`,
    `IS  - ${paper.issue || 1}`,
    `SP  - ${paper.firstPage || 1}`,
    `EP  - ${paper.lastPage || 10}`,
    `PY  - ${year}`,
    `DO  - ${paper.doi}`,
    `UR  - ${window.location.origin}/article/${paper.slug}`,
    `M3  - ${paper.articleType || 'Original Research'}`,
    'ER  - ',
  ];
  return lines.join('\n');
}

export function generateApa(paper: Paper): string {
  const authors = (paper.authors || [])
    .map((a) => {
      const parts = a.name.split(' ');
      const lastName = parts.pop() || '';
      const initials = parts.map((p) => `${p[0]}.`).join(' ');
      return `${lastName}, ${initials}`.trim();
    })
    .join(', & ');

  const year = paper.publishedDate ? paper.publishedDate.split('-')[0] : '2026';
  return `${authors} (${year}). ${paper.title}. ${paper.journalTitle || 'Journal of Financial Artificial Intelligence'}, ${paper.volume}(${paper.issue}), ${paper.firstPage}-${paper.lastPage}. https://doi.org/${paper.doi}`;
}

export function generateMla(paper: Paper): string {
  const firstAuthor = paper.authors?.[0]?.name || '';
  const parts = firstAuthor.split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  const authorStr = paper.authors.length > 1 ? `${lastName}, ${firstName}, et al.` : `${lastName}, ${firstName}.`;
  const year = paper.publishedDate ? paper.publishedDate.split('-')[0] : '2026';

  return `${authorStr} "${paper.title}." ${paper.journalTitle || 'Journal of Financial Artificial Intelligence'}, vol. ${paper.volume}, no. ${paper.issue}, ${year}, pp. ${paper.firstPage}-${paper.lastPage}.`;
}

export function generateChicago(paper: Paper): string {
  const authorStr = (paper.authors || []).map((a) => a.name).join(', and ');
  const year = paper.publishedDate ? paper.publishedDate.split('-')[0] : '2026';
  return `${authorStr}. "${paper.title}." ${paper.journalTitle || 'Journal of Financial Artificial Intelligence'} ${paper.volume}, no. ${paper.issue} (${year}): ${paper.firstPage}-${paper.lastPage}. https://doi.org/${paper.doi}`;
}
