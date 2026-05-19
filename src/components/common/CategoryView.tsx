import React, { useState, useMemo } from 'react';
import type { Novel } from '../../lib/parseNovels';
import { NovelListView } from '../novel/NovelListView';
import { NovelGridView } from '../novel/NovelGridView';
import NovelCard from '../novel/NovelCard';
import StatsTab from '../layout/StatsTab';
import { Search, LayoutGrid, List as ListIcon } from 'lucide-react';

interface CategoryViewProps {
  category: string;
  reviews: any[];
  items: Novel[];
  statuses: string[];
  reviewsSlot?: React.ReactNode;
  anilistStats?: any;
}

export default function CategoryView({ category, reviews, items, statuses, reviewsSlot, anilistStats }: CategoryViewProps) {
  const isNovel = category === 'novel';
  const hasStats = !!anilistStats;
  const [activeTab, setActiveTab] = useState(hasStats ? 'Stats' : 'Reviews');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const tabs = useMemo(() => {
    const base = isNovel ? ["Reviews", "Reading list", "Rankings"] : ["Stats", "Reviews", "Watch list", "Rankings"];
    if (category === 'manga') base[2] = "Reading list";
    return base;
  }, [category, isNovel]);

  const reviewsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reviewsRef.current) {
      const cards = reviewsRef.current.querySelectorAll('[data-search-title]');
      let visibleCount = 0;
      cards.forEach((card: any) => {
        const title = card.getAttribute('data-search-title')?.toLowerCase() || '';
        if (title.includes(searchQuery.toLowerCase())) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Handle "No reviews found" for slot
      const noResultsMsg = reviewsRef.current.querySelector('.no-results-msg');
      if (visibleCount === 0 && cards.length > 0) {
        if (!noResultsMsg) {
          const msg = document.createElement('div');
          msg.className = 'no-results-msg col-span-full py-20 text-center text-muted-foreground';
          msg.innerText = 'No reviews found matching your search.';
          reviewsRef.current.appendChild(msg);
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }
  }, [searchQuery, activeTab]);

  const getNovelForItem = (review: any): Novel | null => {
    return items.find(item => {
      const postId = review.id.toLowerCase();
      const slug = item.slug.toLowerCase();
      return postId.includes(slug) || slug.includes(postId.split('/').pop() || '');
    }) || null;
  };

  const getReviewInfo = (itemSlug: string) => {
    const review = reviews.find(r => {
      const postId = r.id.toLowerCase();
      const slug = itemSlug.toLowerCase();
      return postId.includes(slug) || slug.includes(postId.split('/').pop() || '');
    });
    return {
      hasReview: !!review,
      reviewCover: review?.data?.heroImage
    };
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchMatch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = !selectedStatus || item.status === selectedStatus;
      return searchMatch && statusMatch;
    });
  }, [items, searchQuery, selectedStatus]);

  const rankedItems = useMemo(() => {
    return [...items]
      .filter(item => item.rating !== null)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [items]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(post => 
      !searchQuery || post.data.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reviews, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-8 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm -mb-px transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary font-medium text-foreground"
                : "text-muted-foreground border-b-2 border-transparent hover:text-foreground"
            }`}
          >
            {tab === "Stats" && <span className="mr-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-blue-600 rounded-sm scale-90 uppercase">New</span>}
            {tab}
          </button>
        ))}
      </div>

      {/* Controls */}
      {activeTab !== 'Stats' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/50 rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {(activeTab === 'Reading list' || activeTab === 'Watch list' || activeTab === 'Rankings') && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedStatus === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedStatus === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

          {(activeTab === 'Reading list' || activeTab === 'Watch list' || activeTab === 'Rankings') && (
            <div className="flex gap-2">
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
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'Stats' && anilistStats && (
          <StatsTab category={category} stats={anilistStats} />
        )}

        {activeTab === 'Reviews' && (
          <div ref={reviewsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {reviewsSlot ? (
              reviewsSlot
            ) : (
              filteredReviews.length === 0 ? (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  No reviews found matching your search.
                </div>
              ) : (
                filteredReviews.map((post) => {
                  const novel = getNovelForItem(post);
                  const reviewProps = {
                    hasReview: true,
                    reviewCover: post.data.heroImage,
                    reviewDescription: post.data.description,
                    reviewPublishDate: post.data.pubDate?.toISOString(),
                    reviewUpdateDate: post.data.updatedDate?.toISOString(),
                    tags: post.data.tags,
                  };

                  if (novel) {
                    return <NovelCard key={post.id} novel={novel} {...reviewProps} />;
                  }
                  
                  // Fallback for posts without a database entry
                  const mockNovel: Novel = {
                    id: 0,
                    name: post.data.title,
                    slug: post.id.split('/').pop() || '',
                    media_type: category,
                    status: 'Reviewed',
                    read_chapters: 0,
                    total_chapters: 0,
                    rating: post.data.rating || null,
                    cover_url: typeof post.data.heroImage === 'string' ? post.data.heroImage : post.data.heroImage?.src || null,
                    synopsis: post.data.description || null,
                    author: null, origin: null, source_url: null, pages_left: null, start_date: null, end_date: null, review_slug: null, genres: [], tags: [], created_at: '', updated_at: ''
                  };
                  return <NovelCard key={post.id} novel={mockNovel} {...reviewProps} />;
                })
              )
            )}
          </div>
        )}

        {(activeTab === 'Reading list' || activeTab === 'Watch list') && (
          <div className="space-y-6">
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                No items found matching your filters.
              </div>
            ) : (
              viewMode === 'list' ? (
                <NovelListView novels={filteredItems} getReviewInfo={getReviewInfo} />
              ) : (
                <NovelGridView novels={filteredItems} getReviewInfo={getReviewInfo} />
              )
            )}
          </div>
        )}

        {activeTab === 'Rankings' && (
          <div className="space-y-6">
            {rankedItems.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                No items with ratings found.
              </div>
            ) : (
              viewMode === 'list' ? (
                <NovelListView novels={rankedItems} getReviewInfo={getReviewInfo} />
              ) : (
                <NovelGridView novels={rankedItems} getReviewInfo={getReviewInfo} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
