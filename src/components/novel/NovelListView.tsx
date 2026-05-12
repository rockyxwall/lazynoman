import React from 'react';
import type { Novel } from '../../lib/parseNovels';

interface NovelListViewProps {
  novels: Novel[];
  getReviewInfo: (slug: string) => { hasReview: boolean; reviewCover?: string | any };
}

export function NovelListView({ novels, getReviewInfo }: NovelListViewProps) {
  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap min-w-[500px]">
        <thead className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold border-b border-border/50">
          <tr>
            <th className="px-4 py-3 w-full font-semibold">Title</th>
            <th className="px-4 py-3 text-center font-semibold">Score</th>
            <th className="px-4 py-3 text-center font-semibold">Chapters</th>
            <th className="px-4 py-3 text-center font-semibold">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {novels.map(novel => {
            const { hasReview } = getReviewInfo(novel.slug);
            return (
              <tr key={novel.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3 flex items-center gap-3 max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                  <span className="font-medium text-foreground truncate block">
                    {novel.name}
                  </span>
                  {hasReview && (
                    <a 
                      href={`/${novel.slug}`}
                      className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" 
                      title="Read Review"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-medium text-muted-foreground">{novel.rating ? novel.rating : '-'}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {novel.read_chapters}/{novel.total_chapters || '?'}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {novel.media_type || 'Manga'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
