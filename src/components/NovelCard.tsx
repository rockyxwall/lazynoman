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
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const progress = getProgress(novel.read_chapters, novel.total_chapters);
  const hasCover = !!novel.cover_url;

  return (
    <a
      href={`/novel/${novel.slug}`}
      className="novel-card group no-underline block h-full"
    >
      <div className="nv bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:bg-muted">
        {/* Cover Section or Title-Only Header */}
        {novel.read_chapters > 0 || hasCover ? (
          <div className="cover h-40 overflow-hidden shrink-0 relative">
            {hasCover ? (
              <img
                src={novel.cover_url || ''}
                alt={novel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="cover-typo w-full h-full bg-background border-b border-border flex flex-col justify-end p-4 relative overflow-hidden">
                <div className="cover-typo-bg absolute -top-4 -right-4 font-heading font-black text-8xl text-foreground opacity-[0.05] whitespace-nowrap">
                  {getInitials(novel.name)}
                </div>
                <div className="cover-typo-title font-heading font-bold text-lg leading-tight tracking-tight text-foreground z-10 uppercase italic">
                  {novel.name}
                </div>
                <div className="cover-typo-sub font-mono text-[9px] tracking-[0.2em] text-muted-foreground z-10 uppercase mt-1">
                  {novel.status} · {novel.genres[0] || 'Novel'}
                </div>
              </div>

            )}
          </div>
        ) : (
          <div className="p-6 pb-0">
            <div className="w-8 h-1 bg-primary rounded-full mb-4"></div>
          </div>
        )}

        {/* Body Section */}
        <div className={`body p-5 flex flex-col gap-4 flex-1 ${!hasCover && novel.read_chapters === 0 ? 'justify-between min-h-[160px]' : ''}`}>
          <div>
            <div className="badges flex gap-2 flex-wrap mb-3">
              <span className="badge-solid bg-primary text-primary-foreground font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">
                {novel.status}
              </span>
              {hasReview && (
                <span className="badge-review bg-accent text-accent-foreground font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">
                  Review
                </span>
              )}
            </div>

            <h2 className={`title font-heading font-black leading-tight tracking-tighter group-hover:text-primary transition-colors italic uppercase ${!hasCover && novel.read_chapters === 0 ? 'text-2xl' : 'text-lg'}`}>
              {novel.name}
            </h2>
          </div>

          {novel.read_chapters > 0 ? (
            <div className="space-y-4">
              {/* Progress */}
              <div className="progress flex flex-col gap-2">
                <div className="bar h-0.5 bg-muted rounded-full overflow-hidden">
                  <div className="fill h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress || 33}%` }}></div>
                </div>
                <div className="prog-lbl font-mono text-[10px] flex justify-between text-muted-foreground uppercase tracking-widest">
                  <span><strong>CH. {novel.read_chapters.toLocaleString()}</strong></span>
                  <span>/ {novel.total_chapters ? novel.total_chapters.toLocaleString() : '???'}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="dates flex items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground/60 uppercase">
                <span>{formatDate(novel.start_date) || 'XXXX.XX'}</span>
                <div className="dates-line flex-1 h-[0.5px] bg-border/50"></div>
                <span>{formatDate(novel.end_date) || 'PRESENT'}</span>
              </div>
            </div>
          ) : (
            <p className="not-started font-mono text-[10px] tracking-widest text-muted-foreground uppercase mt-auto">
              Not started · 0 chapters
            </p>
          )}

          {/* Stats footer if rating exists */}
          {novel.rating && (
            <div className="stats pt-4 border-t border-border flex gap-6 mt-auto">
              <div className="stat flex flex-col">
                <div className="stat-val font-mono text-xs font-bold">{novel.rating}</div>
                <div className="stat-lbl font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Rating</div>
              </div>
              {progress > 0 && (
                <div className="stat flex flex-col">
                  <div className="stat-val font-mono text-xs font-bold">{progress}%</div>
                  <div className="stat-lbl font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Done</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
