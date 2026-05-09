import React, { useState, useMemo } from 'react';
import type { Novel } from '../lib/parseNovels';
import { Badge } from './ui/badge';

interface NovelListProps {
  initialNovels: Novel[];
  genres: string[];
  statuses: string[];
  reviewedSlugs?: string[];
}

export default function NovelList({ initialNovels, genres, statuses, reviewedSlugs = [] }: NovelListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const hasReview = (novelSlug: string) => {
    return reviewedSlugs.some(id => {
      const postId = id.toLowerCase();
      const slug = novelSlug.toLowerCase();
      return postId.includes(slug) || slug.includes(postId.split('/').pop() || '');
    });
  };

  const filteredNovels = useMemo(() => {
    return initialNovels
      .filter((novel) => {
        const statusMatch = !selectedStatus || novel.status === selectedStatus;
        const genreMatch = !selectedGenre || novel.genres.includes(selectedGenre);
        return statusMatch && genreMatch;
      })
      .sort((a, b) => {
        // Handle null/missing start dates by putting them at the end
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        
        const dateA = new Date(a.start_date).getTime();
        const dateB = new Date(b.start_date).getTime();
        
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;

        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [initialNovels, selectedStatus, selectedGenre, sortOrder]);

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
          My personal library, synced live from Notion. Every chapter read, every rating given.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <aside className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic">Sort By Start Date</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder('desc')}
              className={`flex-1 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                sortOrder === 'desc'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-card hover:bg-muted text-foreground'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`flex-1 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                sortOrder === 'asc'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-card hover:bg-muted text-foreground'
              }`}
            >
              Oldest
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic">Status</h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all text-left ${
                selectedStatus === null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-card hover:bg-muted text-foreground'
              }`}
            >
              All
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all text-left ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground italic">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                  selectedGenre === genre
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-card hover:bg-muted text-foreground'
                }`}
              >
                #{genre}
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
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Clear Filters
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNovels.length > 0 ? (
            filteredNovels.map((novel) => (
              <a
                key={novel.id}
                href={`/novel/${novel.slug}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col no-underline text-foreground"
              >
                <div className="p-6 flex gap-4 flex-grow">
                  <div className="w-20 h-28 bg-muted rounded-xl flex-shrink-0 flex items-center justify-center text-muted-foreground border border-border overflow-hidden">
                    <img
                      src={novel.cover_url || '/img/placeholder.webp'}
                      alt={novel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg">
                        {novel.status}
                      </Badge>
                      {hasReview(novel.slug) && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-black px-2 py-0.5 rounded-lg">
                          Review
                        </Badge>
                      )}
                      {novel.rating && (
                        <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                          ★ {novel.rating}
                        </span>
                      )}
                    </div>
                    <h2 className="font-black text-lg leading-tight group-hover:text-primary transition-colors truncate">
                      {novel.name}
                    </h2>
                    <div className="flex flex-wrap gap-1">
                      {novel.genres.slice(0, 3).map((genre) => (
                        <span key={genre} className="text-[10px] font-bold text-muted-foreground">
                          #{genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-between items-center">
                  <div className="flex gap-4">
                    <p className="text-xs font-bold">
                      <span className="text-muted-foreground">Chapters:</span> {novel.read_chapters}
                    </p>
                    {novel.start_date && (
                      <p className="text-xs font-bold">
                        <span className="text-muted-foreground">Started:</span> {new Date(novel.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-black italic uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full py-12 text-center space-y-4">
              <p className="text-muted-foreground font-bold">No novels found matching these filters.</p>
              <button
                onClick={() => {
                  setSelectedStatus(null);
                  setSelectedGenre(null);
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
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
