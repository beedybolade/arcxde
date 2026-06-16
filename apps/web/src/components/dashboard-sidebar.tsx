'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Geist', system-ui, sans-serif";

interface NavItem {
  label: string;
  iconSrc: string;
  href: string;
  active?: boolean;
}

/**
 *   vertical divider at x=244.5, 1px, color #3e3e3e
 *   egg: top 78, left 36, 95.8×98.7
 *   nav icons+labels at left 51/122, various tops
 *   font: 16px / 300, text-transform uppercase for section items
 */

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', iconSrc: '/icons/home.svg', href: '#', active: true },
  { label: 'Courses', iconSrc: '/icons/route.svg', href: '#' },
  { label: 'Favourites', iconSrc: '/icons/favourites.svg', href: '#' },
  { label: 'Rewards', iconSrc: '/icons/rewards.svg', href: '#' },
  { label: 'Glossary', iconSrc: '/icons/book_2.svg', href: '#' },
  { label: 'Search', iconSrc: '/icons/search.svg', href: '#' },
];

const BOTTOM_ITEM: NavItem = {
  label: 'Profile',
  iconSrc: '/icons/account_circle.svg',
  href: '#',
};

export const DashboardSidebar = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('fixed left-0 top-0 h-screen bg-[#1a1918]', className)}
    style={{ width: 244, borderRight: '1px solid #3e3e3e' }}
    {...props}
  >
    {/* Egg — top:78 left:36 */}
    <div style={{ position: 'absolute', top: 78, left: 36 }}>
      <SlantEgg size="sm" />
    </div>

    <nav style={{ position: 'absolute', top: 289, left: 0, width: '100%' }}>
      {NAV_ITEMS.map((item, i) => {
        const tops = [302, 381, 459, 547, 808, 870];
        return (
          <a
            key={item.label}
            href={item.href}
            style={{
              position: 'absolute',
              top: tops[i] - 289,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              width: '100%',
              textDecoration: 'none',
            }}
          >
            <img
              src={item.iconSrc}
              alt=""
              aria-hidden
              style={{
                position: 'absolute',
                left: 51,
                width: 42,
                height: 42,
                opacity: item.active ? 1 : 0.7,
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 122,
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: 300,
                lineHeight: '150%',
                color: item.active ? '#fff' : '#6b6b6b',
              }}
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>

    {/* Profile — bottom, top≈1237 */}
    <a
      href={BOTTOM_ITEM.href}
      style={{
        position: 'absolute',
        top: 1218,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      <img
        src={BOTTOM_ITEM.iconSrc}
        alt=""
        aria-hidden
        style={{ position: 'absolute', left: 51, width: 51, height: 51, opacity: 0.7 }}
      />
      <span
        style={{
          position: 'absolute',
          left: 123,
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: '150%',
          color: '#6b6b6b',
        }}
      >
        {BOTTOM_ITEM.label}
      </span>
    </a>
  </div>
);

DashboardSidebar.displayName = 'DashboardSidebar';
