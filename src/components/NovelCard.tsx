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
      className="novel-card group no-underline block h-full"
    >
      <div className="nv bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:bg-muted">
        
        {/* --- UNIVERSAL MINIMALIST COVER AREA --- */}
        <div className="cover h-40 overflow-hidden shrink-0 relative border-b border-border bg-muted/30">
          {hasCover ? (
            <img
              src={novel.cover_url || ''}
              alt={novel.name}
              className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
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
        <div className={`body p-5 flex flex-col gap-4 flex-1 ${bodyState === 'unread' ? 'justify-between min-h-[160px]' : ''}`}>
          
          {/* Header (All States) */}
          <div>
            <div className="badges flex gap-2 flex-wrap mb-3">
              <span className="badge-solid bg-primary text-primary-foreground font-mono text-[12px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">
                {novel.status}
              </span>
              {hasReview && (
                <span className="badge-review bg-accent text-accent-foreground font-mono text-[12px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">
                  Review
                </span>
              )}
            </div>

            <h2 className={`title font-heading font-black leading-tight tracking-tighter group-hover:text-primary transition-colors italic uppercase ${bodyState === 'unread' ? 'text-2xl' : 'text-xl'}`}>
              {novel.name}
            </h2>
            {bodyState === 'unread' && <div className="to-rule w-8 h-1 bg-primary rounded-full mt-4"></div>}
          </div>

          {/* Conditional Content */}
          {bodyState === 'unread' ? (
            /* State: Unread */
            <p className="not-started font-mono text-[12px] tracking-[0.15em] text-muted-foreground uppercase">
              Not started · 0 chapters read
            </p>
          ) : (
            /* State: Tracker (Basic or Extended) */
            <div className="flex-1 flex flex-col gap-4">
              <div className="progress flex flex-col gap-2 mt-auto">
                <div className="bar h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="fill h-full bg-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${novel.total_chapters ? progress : (novel.read_chapters > 0 ? 33 : 0)}%` }}
                  ></div>
                </div>
                <div className="prog-lbl font-mono text-[13px] flex justify-between text-muted-foreground uppercase tracking-widest">
                  <span><strong>CH. {novel.read_chapters.toLocaleString()}</strong></span>
                  {novel.total_chapters ? (
                    <span>/ {novel.total_chapters.toLocaleString()}</span>
                  ) : (
                    <span className="opacity-40 lowercase text-[11px]">no total</span>
                  )}
                </div>
              </div>

              {bodyState === 'extended' && (
                <div className="space-y-4 pt-2">
                  <div className="dates flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground/60 uppercase">
                    <span>{formatDate(novel.start_date) || 'XXXX.XX'}</span>
                    <div className="dates-line flex-1 h-[1px] bg-border/50"></div>
                    <span>{formatDate(novel.end_date) || 'PRESENT'}</span>
                  </div>

                  {novel.rating && (
                    <div className="stats pt-4 border-t border-border flex gap-6">
                      <div className="stat flex flex-col">
                        <div className="stat-val font-mono text-xs font-bold">{novel.rating}</div>
                        <div className="stat-lbl font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rating</div>
                      </div>
                      {progress > 0 && (
                        <div className="stat flex flex-col">
                          <div className="stat-val font-mono text-xs font-bold">{progress}%</div>
                          <div className="stat-lbl font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Done</div>
                        </div>
                      )}
                    </div>
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
