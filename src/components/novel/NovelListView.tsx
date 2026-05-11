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
                  <a href={`/novel/${novel.slug}`} className="font-medium text-foreground group-hover:text-primary transition-colors truncate block">
                    {novel.name}
                  </a>
                  {hasReview && <span className="shrink-0 inline-flex w-1.5 h-1.5 rounded-full bg-primary" title="Has Review"></span>}
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
