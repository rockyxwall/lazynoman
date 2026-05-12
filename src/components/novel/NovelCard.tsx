import React from 'react';
import type { Novel } from '../../lib/parseNovels';

interface NovelCardProps {
  novel: Novel;
  hasReview?: boolean;
  reviewCover?: string | any;
  // --- Review-specific props ---
  reviewDescription?: string;
  reviewPublishDate?: string;
  reviewUpdateDate?: string;
  tags?: string[];
}

export default function NovelCard({
  novel,
  hasReview,
  reviewCover,
  reviewDescription,
  reviewPublishDate,
  reviewUpdateDate,
  tags,
}: NovelCardProps) {

  const getProgress = (read: number, total: number) => {
    if (!total || total === 0) return null;
    return Math.min(Math.round((read / total) * 100), 100);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatShortDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getInitials = (name: string) => {
    const stopWords = ['of', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'and'];
    const parts = name.split(/[^a-zA-Z0-9]+/).filter(w => w && !stopWords.includes(w.toLowerCase()));
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 10 - full - (half ? 1 : 0);
    return (
      <span className="inline-flex items-center gap-px text-primary">
        {'★'.repeat(full)}
        {half && <span className="opacity-50">★</span>}
        <span className="text-primary/20">{'★'.repeat(empty)}</span>
      </span>
    );
  };

  const progress       = getProgress(novel.read_chapters, novel.total_chapters);
  const displayCover   = novel.cover_url || reviewCover;
  const hasCover       = !!displayCover;
  const isNotStarted   = novel.read_chapters === 0;
  const mediaUnit      = novel.media_type === 'anime' ? 'ep' : 'ch';

  return (
    <a
      href={`/${novel.media_type || 'novel'}/${novel.slug}`}
      className="novel-card group no-underline block h-full relative outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Corner accent lines */}
      {['tl','tr','bl','br'].map(pos => (
        <div
          key={pos}
          className={`
            absolute w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 rounded-${pos === 'tl' ? 'tl' : pos === 'tr' ? 'tr' : pos === 'bl' ? 'bl' : 'br'}-xl
            ${pos === 'tl' ? '-top-1 -left-1 border-t-2 border-l-2' : ''}
            ${pos === 'tr' ? '-top-1 -right-1 border-t-2 border-r-2' : ''}
            ${pos === 'bl' ? '-bottom-1 -left-1 border-b-2 border-l-2' : ''}
            ${pos === 'br' ? '-bottom-1 -right-1 border-b-2 border-r-2' : ''}
            border-primary blur-[1px]
          `}
        />
      ))}

      <div className="nv bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-muted-foreground/50 hover:shadow-xl relative z-10">

        {/* ── COVER ─────────────────────────────────────────── */}
        <div className="cover w-full aspect-video overflow-hidden shrink-0 relative bg-muted/30">
          {hasCover ? (
            <img
              src={displayCover || ''}
              alt={novel.name}
              className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 relative overflow-hidden">
              <span className="font-heading font-black text-6xl text-primary opacity-[0.12] select-none">
                {getInitials(novel.name)}
              </span>
              <span className="font-mono text-[8px] tracking-[0.18em] text-muted-foreground uppercase opacity-50">
                No cover
              </span>
            </div>
          )}

          {/* Status pill — overlaid bottom-left on cover */}
          <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
            <span className="bg-primary text-primary-foreground font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase leading-none shadow-md">
              {novel.status}
            </span>
            {hasReview && (
              <span className="bg-card/90 text-foreground border border-border/80 backdrop-blur font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase leading-none shadow-md">
                Review
              </span>
            )}
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-4 space-y-3">

          {/* Title */}
          <h2 className="font-heading font-bold text-xl leading-tight tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-2">
            {novel.name}
          </h2>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[9px] tracking-wider uppercase bg-muted/60 text-muted-foreground border border-border/60 px-2 py-0.5 rounded-full leading-none"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 5 && (
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground/60 px-1 leading-none self-center">
                  +{tags.length - 5}
                </span>
              )}
            </div>
          )}

          {/* ── READING STATS SECTION ── */}
          {!isNotStarted ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 divide-y divide-border/40">

              {/* Progress bar row */}
              <div className="px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Progress</span>
                  {progress !== null && (
                    <span className="font-mono text-[10px] font-bold text-primary">{progress}%</span>
                  )}
                </div>
                
                {progress !== null && (
                  <div className="w-full h-1 bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground/70">
                    {novel.read_chapters.toLocaleString()} {mediaUnit} read
                  </span>
                  {novel.total_chapters > 0 && (
                    <span className="font-mono text-[9px] text-muted-foreground/70">
                      {novel.total_chapters.toLocaleString()} total
                    </span>
                  )}
                </div>
              </div>

              {/* Rating + Dates row */}
              <div className="grid grid-cols-3 divide-x divide-border/40">
                {/* Rating */}
                {novel.rating ? (
                  <div className="px-3 py-2 flex flex-col gap-1 items-center">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/70">Rating</span>
                    <span className="font-mono text-sm font-bold leading-none">{novel.rating}<span className="text-[9px] text-muted-foreground">/10</span></span>
                    <span className="text-[7px] leading-none">{renderStars(novel.rating)}</span>
                  </div>
                ) : (
                  <div className="px-3 py-2 flex flex-col gap-1 items-center justify-center">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40">Rating</span>
                    <span className="font-mono text-[10px] text-muted-foreground/30">—</span>
                  </div>
                )}

                {/* Start date */}
                <div className="px-3 py-2 flex flex-col gap-1 items-center">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/70">Started</span>
                  <span className="font-mono text-[10px] font-bold leading-none text-center">
                    {formatDate(novel.start_date) ?? <span className="text-muted-foreground/30">—</span>}
                  </span>
                </div>

                {/* End date */}
                <div className="px-3 py-2 flex flex-col gap-1 items-center">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/70">Finished</span>
                  <span className="font-mono text-[10px] font-bold leading-none text-center">
                    {novel.end_date
                      ? formatDate(novel.end_date)
                      : <span className="text-primary/60 text-[8px] tracking-widest">Ongoing</span>
                    }
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Not started state */
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              Not started · 0 {mediaUnit} read
            </p>
          )}

          {/* ── REVIEW SECTION ── */}
          {hasReview && (reviewDescription || reviewPublishDate || reviewUpdateDate) && (
            <div className="border-t border-border/50 pt-3 space-y-2 mt-auto">

              {/* Review label */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold">My Review</span>
                <div className="flex-1 h-px bg-primary/20" />
              </div>

              {/* Description excerpt */}
              {reviewDescription && (
                <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-3 font-sans">
                  {reviewDescription}
                </p>
              )}

              {/* Publish / Update dates */}
              {(reviewPublishDate || reviewUpdateDate) && (
                <div className="flex items-center gap-3 pt-1">
                  {reviewPublishDate && (
                    <span className="font-mono text-[9px] text-muted-foreground/60 flex items-center gap-1">
                      <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Published {formatShortDate(reviewPublishDate)}
                    </span>
                  )}
                  {reviewUpdateDate && (
                    <span className="font-mono text-[9px] text-muted-foreground/60 flex items-center gap-1">
                      <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Updated {formatShortDate(reviewUpdateDate)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}