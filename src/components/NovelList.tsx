import React, { useState, useMemo } from 'react';
import type { Novel } from '../lib/parseNovels';
import BackToTop from './BackToTop';
import { Search, ArrowUpDown, LayoutGrid, List as ListIcon } from 'lucide-react';
import { NovelListView } from './custom-ui/NovelListView';
import { NovelGridView } from './custom-ui/NovelGridView';

interface NovelListProps {
  initialNovels: Novel[];
  genres: string[];
  statuses: string[];
  reviewedReviews?: { id: string; heroImage?: string | any }[];
}

export default function NovelList({ initialNovels, genres, statuses, reviewedReviews = [] }: NovelListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showOnlyReviewed, setShowOnlyReviewed] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
        const searchMatch = !searchQuery || novel.name.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatch && genreMatch && reviewMatch && searchMatch;
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
  }, [initialNovels, selectedStatus, selectedGenre, showOnlyReviewed, sortOrder, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All': filteredNovels.length };
    statuses.forEach(s => counts[s] = 0);
    filteredNovels.forEach(n => {
      if (counts[n.status] !== undefined) {
        counts[n.status]++;
      }
    });
    return counts;
  }, [filteredNovels, statuses]);

  const groupedNovels = useMemo(() => {
    const groups: Record<string, Novel[]> = {};
    if (selectedStatus) {
      groups[selectedStatus] = filteredNovels;
    } else {
      statuses.forEach(s => groups[s] = []);
      filteredNovels.forEach(n => {
        if (groups[n.status]) {
          groups[n.status].push(n);
        } else {
          groups[n.status] = [n];
        }
      });
    }
    return groups;
  }, [filteredNovels, selectedStatus, statuses]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-[240px] shrink-0 space-y-8 font-sans">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/50 text-foreground rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground text-[13px]"
            />
          </div>

          {/* Lists */}
          <div>
            <h3 className="mb-3 text-[13px] font-semibold text-muted-foreground">Lists</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors group ${selectedStatus === null ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <span>All</span>
                  <span className={`text-[12px] font-medium ${selectedStatus === null ? 'text-secondary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{statusCounts['All']}</span>
                </button>
              </li>
              {statuses.map(status => (
                <li key={status}>
                  <button 
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors group ${selectedStatus === status ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <span>{status}</span>
                    <span className={`text-[12px] font-medium ${selectedStatus === status ? 'text-secondary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{statusCounts[status]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filters */}
          <div>
            <h3 className="mb-3 text-[13px] font-semibold text-muted-foreground">Filters</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowOnlyReviewed(!showOnlyReviewed)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${showOnlyReviewed ? 'bg-secondary text-secondary-foreground' : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <span>Reviewed</span>
                {showOnlyReviewed && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>}
              </button>
              
              <div className="pt-2">
                <h4 className="text-[11px] uppercase text-muted-foreground mb-2 font-semibold">Genres</h4>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                      className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors ${selectedGenre === genre ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="mb-3 text-[13px] font-semibold text-muted-foreground">Sort Order</h3>
            <button 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full flex items-center justify-between px-3 py-2 bg-card border border-border/50 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span>{sortOrder === 'desc' ? 'Last Added' : 'Oldest First'}</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
          
          {(selectedStatus || selectedGenre || searchQuery || showOnlyReviewed) && (
            <button
              onClick={() => { setSelectedStatus(null); setSelectedGenre(null); setSearchQuery(''); setShowOnlyReviewed(false); }}
              className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >Clear All Filters</button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0 w-full">
          {/* View Toggles */}
          {filteredNovels.length > 0 && (
            <div className="flex justify-end gap-2 mb-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-10">
            {Object.entries(groupedNovels).map(([status, novels]) => {
              if (novels.length === 0) return null;
              return (
                <div key={status} className="space-y-4">
                  <h2 className="text-[1.15rem] font-semibold tracking-tight text-foreground">{status}</h2>
                  {viewMode === 'list' ? (
                    <NovelListView novels={novels} getReviewInfo={getReviewInfo} />
                  ) : (
                    <NovelGridView novels={novels} getReviewInfo={getReviewInfo} />
                  )}
                </div>
              );
            })}
          </div>
          
          {filteredNovels.length === 0 && (
            <div className="py-12 text-center space-y-4">
              <p className="text-muted-foreground font-black italic uppercase tracking-tighter text-2xl">No items found matching these filters.</p>
              <button
                onClick={() => { setSelectedStatus(null); setSelectedGenre(null); setSearchQuery(''); setShowOnlyReviewed(false); }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-colors"
              >Clear Filters</button>
            </div>
          )}
        </div>
      </div>
      <BackToTop />
    </div>
  );
}

