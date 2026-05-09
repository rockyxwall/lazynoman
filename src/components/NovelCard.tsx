import React from 'react';
import type { Novel } from '../lib/parseNovels';

interface NovelCardProps {
  novel: Novel;
  hasReview?: boolean;
}

export default function NovelCard({ novel, hasReview }: NovelCardProps) {
  const getProgress = (read: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min(Math.round((read / total) * 100), 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace('/', '.');
  };

  const getInitials = (name: string) => {
    // Filter out common stop words to get meaningful initials (e.g. Sovereign of the Stars -> SS)
    const stopWords = ['of', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'and'];
    const parts = name.split(/[^a-zA-Z0-9]+/).filter(w => w && !stopWords.includes(w.toLowerCase()));
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const progress = getProgress(novel.read_chapters, novel.total_chapters);
  const hasCover = !!novel.cover_url;
  const isNotStarted = novel.read_chapters === 0;
  const hasExtendedMetadata = !!(novel.rating || novel.start_date);

  // Body State logic
  let bodyState: 'extended' | 'basic' | 'unread' = 'basic';
  if (isNotStarted) {
    bodyState = 'unread';
  } else if (hasExtendedMetadata) {
    bodyState = 'extended';
  }

  return (
    <a
      href={`/novel/${novel.slug}`}
      className="novel-card group no-underline block h-full relative"
    >
      {/* --- EXTERNAL CORNER GLOW ACCENTS (CONCENTRIC BENDS) --- */}
      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-tl-[12px]"></div>
      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-tr-[12px]"></div>
      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-bl-[12px]"></div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-br-[12px]"></div>

      <div className="nv bg-card border border-border rounded-xl p-4 flex flex-col h-full transition-all duration-300 hover:border-muted-foreground/50 hover:shadow-xl relative z-10 space-y-3">
        {/* --- UNIVERSAL MINIMALIST COVER AREA --- */}
        <div className="cover w-full aspect-video overflow-hidden shrink-0 relative rounded-lg border border-border/50 bg-muted/30">
          {hasCover ? (
            <img
              src={novel.cover_url || ''}
              alt={novel.name}
              className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="cover-placeholder w-full h-full flex flex-col items-center justify-center gap-1 relative overflow-hidden">
              <div className="cover-placeholder-init font-heading font-black text-6xl text-primary opacity-[0.15] select-none">
                {getInitials(novel.name)}
              </div>
              <div className="cover-placeholder-line font-mono text-[8px] tracking-[0.15em] text-muted-foreground uppercase opacity-70">
                No cover available
              </div>
            </div>
          )}
        </div>

        {/* --- DATA-DRIVEN BODY --- */}
        <div className={`body flex flex-col space-y-2 flex-1 ${bodyState === 'unread' ? 'justify-between' : ''}`}>
          
          {/* Header (All States) */}
          <div className="space-y-2">
            <div className="badges flex gap-2 flex-wrap items-center">
              <span className="badge-solid bg-primary text-primary-foreground font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase leading-none">
                {novel.status}
              </span>
              {hasReview && (
                <span className="badge-review bg-secondary text-secondary-foreground border border-border font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase leading-none">
                  Review
                </span>
              )}
            </div>

            <h2 className={`title font-heading font-bold leading-tight tracking-tight group-hover:text-primary transition-colors uppercase ${bodyState === 'unread' ? 'text-2xl' : 'text-xl'}`}>
              {novel.name}
            </h2>
          </div>

          {/* Conditional Content */}
          {bodyState === 'unread' ? (
            /* State: Unread */
            <p className="not-started font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              Not started · 0 chapters read
            </p>
          ) : (
            /* State: Tracker (Basic or Extended) */
            <div className="flex-1 flex flex-col space-y-4">
              {bodyState === 'extended' && (
                <div className="metadata grid grid-cols-[auto_1px_auto_1px_1fr] gap-x-3 pt-3 border-t border-border mt-auto">
                  {/* Column 1: Total Chapters */}
                  <div className="flex flex-col items-center gap-1 py-1 min-w-[35px]">
                    <div className="font-mono text-[11px] font-bold leading-none">
                      {novel.total_chapters ? novel.total_chapters.toLocaleString() : novel.read_chapters.toLocaleString()}
                    </div>
                    <div className="w-px h-2 bg-border/50 my-0.5"></div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60 leading-none">Total</div>
                  </div>

                  {/* Column 2: Separator */}
                  <div className="w-[1px] bg-border/50 self-stretch"></div>

                  {/* Column 3: Dates (Start & End) */}
                  <div className="flex flex-col items-center gap-1 py-1 min-w-[55px]">
                    <div className="font-mono text-[9px] font-bold tracking-widest uppercase leading-none text-muted-foreground/80">
                      {formatDate(novel.start_date) || 'XXXX.XX'}
                    </div>
                    <div className="w-px h-2 bg-border/50 my-0.5"></div>
                    <div className="font-mono text-[9px] font-bold tracking-widest uppercase leading-none text-muted-foreground/80">
                      {formatDate(novel.end_date) || 'PRESENT'}
                    </div>
                  </div>

                  {/* Column 4: Separator */}
                  <div className="w-[1px] bg-border/50 self-stretch"></div>

                  {/* Column 5: Stats & Stars */}
                  <div className="flex items-center gap-4 py-1 h-full overflow-hidden">
                    {novel.rating && (
                      <div className="flex flex-col items-start gap-1 min-w-[70px] flex-1">
                        <div className="flex items-center gap-1.5 w-full">
                          <div className="font-mono text-[11px] font-bold leading-none">{novel.rating}</div>
                          <div className="flex text-[8px] text-primary/40 tracking-tighter shrink-0">
                            {'★'.repeat(Math.floor(novel.rating))}
                            {'☆'.repeat(10 - Math.floor(novel.rating))}
                          </div>
                        </div>
                        <div className="w-full h-[1px] bg-border/50 my-0.5"></div>
                        <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60 leading-none">Rating</div>
                      </div>
                    )}
                    {progress > 0 && (
                      <div className="flex flex-col items-center gap-1 py-1 min-w-[35px]">
                        <div className="font-mono text-[11px] font-bold leading-none">{progress}</div>
                        <div className="w-px h-2 bg-border/50 my-0.5"></div>
                        <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60 leading-none">Done</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
