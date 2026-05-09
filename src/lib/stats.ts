import type { Novel } from './parseNovels';

export interface Achievement {
  label: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface Stats {
  finishedCount: number;
  readingCount: number;
  droppedCount: number;
  pausedCount: number;
  totalChapters: number;
  avgRating: string;
  achievements: Achievement[];
}

export function computeStats(novels: Novel[]): Stats {
  const finished = novels.filter((n) => n.status === 'Finished');
  const reading = novels.filter((n) => n.status === 'Reading');
  const dropped = novels.filter((n) => n.status === 'Dropped');
  const paused = novels.filter((n) => n.status === 'Paused');

  const totalChapters = novels.reduce((s, n) => s + n.readChapters, 0);
  
  const ratedNovels = novels.filter((n) => n.rating > 0);
  const avgRating = ratedNovels.length > 0
    ? (ratedNovels.reduce((s, n) => s + n.rating, 0) / ratedNovels.length).toFixed(1)
    : '0.0';

  const achievements: Achievement[] = [
    { 
      label: 'First Drop', 
      description: 'Dropped your first novel. It happens.',
      unlocked: dropped.length >= 1,
      icon: '💀'
    },
    { 
      label: 'Speed Dropper', 
      description: 'Dropped 10 novels. You know what you like.',
      unlocked: dropped.length >= 10,
      icon: '⚡'
    },
    { 
      label: 'Completionist', 
      description: 'Finished 10 novels.',
      unlocked: finished.length >= 10,
      icon: '🏆'
    },
    { 
      label: '1000 Chapters', 
      description: 'Read a total of 1,000 chapters.',
      unlocked: totalChapters >= 1000,
      icon: '📖'
    },
    { 
      label: '10,000 Chapters', 
      description: 'Read a total of 10,000 chapters. Legend.',
      unlocked: totalChapters >= 10000,
      icon: '🔥'
    },
    { 
      label: 'Hoarder', 
      description: 'Have 5 novels on pause.',
      unlocked: paused.length >= 5,
      icon: '📦'
    },
  ];

  return {
    finishedCount: finished.length,
    readingCount: reading.length,
    droppedCount: dropped.length,
    pausedCount: paused.length,
    totalChapters,
    avgRating,
    achievements,
  };
}
