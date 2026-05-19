import React from 'react';

interface AnilistStats {
  count: number;
  episodesWatched?: number;
  chaptersRead?: number;
  minutesWatched?: number;
  meanScore: number;
  scores: { score: number; count: number }[];
  statuses: { status: string; count: number }[];
  genres: { genre: string; count: number }[];
  formats: { format: string; count: number }[];
  releaseYears: { releaseYear: number; count: number }[];
}

interface StatsTabProps {
  category: string;
  stats: AnilistStats;
}

const statusMap: Record<string, string> = {
  COMPLETED: "Completed",
  CURRENT: "Reading/Watching",
  DROPPED: "Dropped",
  PAUSED: "Paused",
  PLANNING: "Planning"
};

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500",
  CURRENT: "bg-blue-500",
  DROPPED: "bg-red-500",
  PAUSED: "bg-yellow-500",
  PLANNING: "bg-neutral-400"
};

export default function StatsTab({ category, stats }: StatsTabProps) {
  const isAnime = category === 'anime' || category === 'movie';

  // Filter and sort genres (top 10)
  const topGenres = [...stats.genres]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const maxGenreCount = Math.max(...topGenres.map(g => g.count), 1);

  // Score distribution (X axis: count, Y axis: score)
  const scoreData = [...stats.scores].sort((a, b) => b.score - a.score);
  const maxScoreCount = Math.max(...scoreData.map(s => s.count), 1);

  // Status counts
  const totalItems = stats.statuses.reduce((acc, s) => acc + s.count, 0);

  // Activity by year (last 5-10 years)
  const yearData = [...stats.releaseYears]
    .sort((a, b) => b.releaseYear - a.releaseYear)
    .slice(0, 8)
    .reverse();
  const maxYearCount = Math.max(...yearData.map(y => y.count), 1);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Row A: Score + Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score Distribution</h3>
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 space-y-3">
            {scoreData.map((s) => (
              <div key={s.score} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{s.score}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary/80 rounded-full" 
                    style={{ width: `${(s.count / maxScoreCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-6">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Watch/Read Status */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isAnime ? 'Watch' : 'Read'} Status</h3>
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 flex flex-col items-center justify-center space-y-6">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  {stats.statuses.reduce((acc, s, _i) => {
                    const percentage = (s.count / totalItems) * 100;
                    const offset = acc.totalOffset;
                    acc.totalOffset += percentage;
                    acc.elements.push(
                      <circle
                        key={s.status}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3.8"
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset={-offset}
                        className={`${statusColors[s.status] || 'text-neutral-500'} stroke-current opacity-80`}
                      />
                    );
                    return acc;
                  }, { totalOffset: 0, elements: [] as React.ReactNode[] }).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{totalItems}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                </div>
             </div>
             <div className="flex flex-wrap gap-2 justify-center">
                {stats.statuses.map(s => (
                  <div key={s.status} className="flex items-center gap-1.5 px-2 py-1 bg-background/50 border border-border/50 rounded-md">
                    <div className={`w-2 h-2 rounded-full ${statusColors[s.status] || 'bg-neutral-500'}`} />
                    <span className="text-[10px] font-medium whitespace-nowrap">{statusMap[s.status] || s.status} {s.count}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Row B: Top Genres */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Top Genres</h3>
        <div className="bg-muted/30 border border-border/50 rounded-xl p-6 space-y-4">
          {topGenres.map((g) => (
            <div key={g.genre} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
                <span>{g.genre}</span>
                <span className="text-muted-foreground">{g.count}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/60 rounded-full" 
                  style={{ width: `${(g.count / maxGenreCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row C: Activity by Year + Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Activity by Year */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Activity by Year</h3>
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 h-48 flex items-end gap-2">
            {yearData.map((y) => (
              <div key={y.releaseYear} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/40 hover:bg-primary/60 transition-colors rounded-t-sm"
                  style={{ height: `${(y.count / maxYearCount) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-[9px] font-mono text-muted-foreground rotate-45 sm:rotate-0">{y.releaseYear}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Format Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Format Breakdown</h3>
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 flex flex-wrap gap-3 items-center justify-center content-center h-48">
            {stats.formats.sort((a,b) => b.count - a.count).map(f => {
               // Calculate relative size
               const maxSize = Math.max(...stats.formats.map(fmt => fmt.count));
               const scale = 0.8 + (f.count / maxSize) * 0.4;
               return (
                 <div 
                  key={f.format} 
                  className="px-4 py-2 bg-background/80 border border-border shadow-sm rounded-lg flex flex-col items-center"
                  style={{ transform: `scale(${scale})` }}
                 >
                    <span className="text-xs font-bold text-primary">{f.format}</span>
                    <span className="text-[10px] text-muted-foreground">{f.count}</span>
                 </div>
               )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
