import React from 'react';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
}

interface NavProps {
  links: NavLink[];
  currentPath: string;
}

export function Nav({ links, currentPath }: NavProps) {
  const getIsActive = (href: string) => {
    const pathname = currentPath.replace(/\/$/, '') || '/';
    const hrefPath = href.replace(/\/$/, '');
    
    if (hrefPath === '/') {
      return pathname === '/';
    }
    
    return pathname.startsWith(hrefPath);
  };

  return (
    <nav className="flex items-center gap-1 sm:gap-4 h-full">
      {links.map((link) => {
        const isActive = getIsActive(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center h-full px-1 sm:px-2 no-underline border-b-4 transition-colors',
              isActive
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent text-foreground/80 hover:text-primary'
            )}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
