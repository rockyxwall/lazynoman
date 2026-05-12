import React from 'react';
import type { Novel } from '../../lib/parseNovels';

interface NovelGridViewProps {
  novels: Novel[];
  getReviewInfo: (slug: string) => { hasReview: boolean; reviewCover?: string | any };
}

export function NovelGridView({ novels, getReviewInfo }: NovelGridViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {novels.map(novel => {
        const { hasReview } = getReviewInfo(novel.slug);
        return (
          <div 
            key={novel.id} 
            className="group relative flex flex-col aspect-[1/1.4] rounded-md overflow-hidden bg-muted shadow-sm"
          >
            {/* Image */}
            {novel.cover_url ? (
              <img 
                src={novel.cover_url} 
                alt={novel.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground p-4 text-center text-xs">
                {novel.name}
              </div>
            )}

            {/* Review Badge/Link */}
            {hasReview && (
              <a 
                href={`/${novel.slug}`}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md z-10 hover:scale-110 transition-transform"
                title="Read Review"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </a>
            )}

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b1622]/95 via-[#0b1622]/60 to-transparent pt-12 pb-3 px-3">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-white font-medium text-[13px] leading-snug line-clamp-2 drop-shadow-md">
                  {novel.name}
                </h3>
                <div className="flex items-center justify-between text-[11px] font-medium text-white/70">
                  <span>
                    {novel.read_chapters}{novel.total_chapters ? `/${novel.total_chapters}` : ''}
                  </span>
                  {novel.rating ? (
                    <span>{novel.rating}</span>
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
