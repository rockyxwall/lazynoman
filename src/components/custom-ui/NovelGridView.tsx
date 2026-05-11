import React from 'react';
import type { Novel } from '../../lib/parseNovels';
import NovelCard from '../NovelCard';

interface NovelGridViewProps {
  novels: Novel[];
  getReviewInfo: (slug: string) => { hasReview: boolean; reviewCover?: string | any };
}

export function NovelGridView({ novels, getReviewInfo }: NovelGridViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {novels.map(novel => {
        const { hasReview, reviewCover } = getReviewInfo(novel.slug);
        return (
          <NovelCard 
            key={novel.id} 
            novel={novel} 
            hasReview={hasReview}
            reviewCover={reviewCover}
          />
        );
      })}
    </div>
  );
}
