import React, { useState, useMemo } from 'react';
import type { Novel } from '../lib/parseNovels';
import NovelCard from './NovelCard';

interface NovelListProps {
  initialNovels: Novel[];
  genres: string[];
  statuses: string[];
  reviewedReviews?: { id: string; heroImage?: string | any }[];
}

export default function NovelList({ initialNovels, genres, statuses, reviewedReviews = [] }: NovelListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showOnlyReviewed, setShowOnlyReviewed] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const getReviewInfo = (novelSlug: string) => {
    const review = reviewedReviews.find(r => {
      const postId = r.id.toLowerCase();
      const slug = novelSlug.toLowerCase();
      return postId.includes(slug) || slug.includes(postId.split('/').pop() || '');
    });
    return {
      hasReview: !!review,
      reviewCover: review?.heroImage
    };
  };

  const filteredNovels = useMemo(() => {
    return initialNovels
      .filter((novel) => {
        const statusMatch = !selectedStatus || novel.status === selectedStatus;
        const genreMatch = !selectedGenre || novel.genres.includes(selectedGenre);
        const reviewMatch = !showOnlyReviewed || getReviewInfo(novel.slug).hasReview;
        return statusMatch && genreMatch && reviewMatch;
      })
      .sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        const dateA = new Date(a.start_date).getTime();
        const dateB = new Date(b.start_date).getTime();
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [initialNovels, selectedStatus, selectedGenre, showOnlyReviewed, sortOrder]);

  const toggleStatus = (status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenre(selectedGenre === genre ? null : genre);
  };

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase">
          Novels ({filteredNovels.length})
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          A list of all the novels I've read and where I am in each story.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic font-mono border-b border-border/50 pb-2">Filters</h3>
              
              {/* Reviewed Toggle */}
              <button
                onClick={() => setShowOnlyReviewed(!showOnlyReviewed)}
                className={`w-full px-4 py-2 rounded-lg border text-[13px] font-bold uppercase tracking-widest font-mono transition-all text-left flex items-center justify-between ${
                  showOnlyReviewed
                    ? 'bg-secondary text-secondary-foreground border-border/50 shadow-sm'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                <span>Reviewed</span>
                <span className={`w-2 h-2 rounded-full ${showOnlyReviewed ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}></span>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic font-mono border-b border-border/50 pb-2">Sort Order</h3>
              <div className="p-1 bg-muted/50 rounded-xl border border-border flex gap-1">
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-2 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest font-mono transition-all ${
                    sortOrder === 'desc'
                      ? 'bg-card text-foreground shadow-sm border border-border/50'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-2 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest font-mono transition-all ${
                    sortOrder === 'asc'
                      ? 'bg-card text-foreground shadow-sm border border-border/50'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Oldest
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic font-mono border-b border-border/50 pb-2">Status</h3>
            <div className="flex flex-col gap-1.5">
              {/* All Statuses as a Primary Toggle */}
              <button
                onClick={() => setSelectedStatus(null)}
                className={`w-full px-4 py-2 rounded-lg border text-[13px] font-bold uppercase tracking-widest font-mono transition-all text-left flex items-center justify-between ${
                  selectedStatus === null
                    ? 'bg-secondary text-secondary-foreground border-border/50 shadow-sm'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                <span>All Statuses</span>
                {selectedStatus === null && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
              </button>

              <div className="h-px bg-border/30 my-1 mx-2"></div>

              {/* Individual Status List */}
              <div className="flex flex-col gap-1.5">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`w-full px-4 py-2 rounded-lg border text-[13px] font-bold uppercase tracking-widest font-mono transition-all text-left flex items-center justify-between ${
                      selectedStatus === status
                        ? 'bg-secondary text-secondary-foreground border-border/50 shadow-sm'
                        : 'border-border bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>{status}</span>
                    {selectedStatus === status && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic font-mono border-b border-border/50 pb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-lg border text-[13px] font-bold uppercase tracking-widest font-mono transition-all flex items-center gap-2 ${
                    selectedGenre === genre
                      ? 'bg-secondary text-secondary-foreground border-border/50 shadow-sm'
                      : 'border-border bg-card hover:bg-muted text-foreground'
                  }`}
                >
                  <span>#{genre}</span>
                  {selectedGenre === genre && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                </button>
              ))}
            </div>
          </div>

          {(selectedStatus || selectedGenre) && (
            <button
              onClick={() => {
                setSelectedStatus(null);
                setSelectedGenre(null);
              }}
              className="text-[12px] font-bold uppercase tracking-widest font-mono text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredNovels.length > 0 ? (
              filteredNovels.map((novel) => {
                const { hasReview, reviewCover } = getReviewInfo(novel.slug);
                return (
                  <NovelCard 
                    key={novel.id} 
                    novel={novel} 
                    hasReview={hasReview}
                    reviewCover={reviewCover}
                  />
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center space-y-4">
                <p className="text-muted-foreground font-black italic uppercase tracking-tighter text-2xl">No novels found matching these filters.</p>
                <button
                  onClick={() => {
                    setSelectedStatus(null);
                    setSelectedGenre(null);
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-black italic uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
