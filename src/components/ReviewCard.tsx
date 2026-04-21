import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReviewCardProps {
  name: string;
  source: string;
  score: number;
  text: string;
  myReaction?: string;
}

const StarRating = ({ score }: { score: number }) => {
  const maxStars = 5;
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    if (i <= score) {
      stars.push(<span key={i} className="text-yellow-500">★</span>);
    } else {
      stars.push(<span key={i} className="text-muted-foreground/30">☆</span>);
    }
  }
  return <div className="flex text-sm" aria-label={`Rating: ${score} out of ${maxStars} stars`}>{stars}</div>;
};

const getInitials = (name: string) => {
  return name.substring(0, 2).toUpperCase();
};

export default function ReviewCard({ name, source, score, text, myReaction }: ReviewCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/40 my-10 overflow-hidden shadow-sm not-prose">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-base shrink-0 font-['Atkinson']">
            {getInitials(name)}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="font-bold text-foreground text-[clamp(1.25rem,3vw,1.5rem)] font-['Atkinson'] tracking-[-0.01em] leading-tight">
              {name}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[0.75rem] uppercase tracking-[0.07em] font-semibold border-border">
                {source}
              </Badge>
              <StarRating score={score} />
            </div>
          </div>
        </div>
        <div className="text-foreground/90 leading-[1.75] whitespace-pre-wrap ml-0 sm:ml-16 font-['Atkinson','Geist_Variable',sans-serif] text-[clamp(1.125rem,1.2vw+0.8rem,1.25rem)]">
          {text}
        </div>
      </div>
      {myReaction && (
        <div className="bg-secondary/30 p-6 md:p-8 border-t border-border/50">
          <div className="ml-0 sm:ml-16 border-l-[3px] border-primary pl-5 py-3 font-['Atkinson','Geist_Variable',sans-serif] italic text-muted-foreground text-[1.1rem] leading-[1.75] bg-secondary/50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3 not-italic">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px] shrink-0 font-sans tracking-normal">
                LN
              </div>
              <span className="font-bold text-sm text-foreground uppercase tracking-[0.05em] font-['Atkinson']">lazynoman</span>
            </div>
            <div>{myReaction}</div>
          </div>
        </div>
      )}
    </div>
  );
}
