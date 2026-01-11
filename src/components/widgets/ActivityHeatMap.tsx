// ABOUTME: GitHub-style calendar heat map showing capture activity
// ABOUTME: Click on a day to filter scraps from that date

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scrap } from '@/types';
import { calculateActivitySummary, getActivityLevel, type ActivityLevel } from '@/services/analytics';
import { cn } from '@/lib/utils';

interface ActivityHeatMapProps {
  scraps: Scrap[];
  months?: number;
  onDayClick?: (date: Date, scrapIds: string[]) => void;
}

const levelColors: Record<ActivityLevel, string> = {
  0: 'bg-slate-100',
  1: 'bg-indigo-200',
  2: 'bg-indigo-300',
  3: 'bg-indigo-400',
  4: 'bg-indigo-600',
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeeksInRange(startDate: Date, endDate: Date): Date[][] {
  const weeks: Date[][] = [];
  const current = new Date(startDate);

  // Align to start of week (Sunday)
  current.setDate(current.getDate() - current.getDay());

  while (current <= endDate) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTooltip(date: Date, count: number): string {
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (count === 0) return `No scraps on ${dateStr}`;
  if (count === 1) return `1 scrap on ${dateStr}`;
  return `${count} scraps on ${dateStr}`;
}

export function ActivityHeatMap({ scraps, months = 3, onDayClick }: ActivityHeatMapProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const activity = useMemo(
    () => calculateActivitySummary(scraps, months),
    [scraps, months]
  );

  const activityMap = useMemo(() => {
    const map = new Map<string, { count: number; scrapIds: string[] }>();
    for (const day of activity.days) {
      map.set(day.date, { count: day.count, scrapIds: day.scrapIds });
    }
    return map;
  }, [activity.days]);

  const weeks = useMemo(
    () => getWeeksInRange(activity.startDate, activity.endDate),
    [activity.startDate, activity.endDate]
  );

  if (scraps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-600"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-700">Activity</h2>
          <span className="text-xs text-slate-500">
            {activity.totalScraps} scraps in last {months} months
          </span>
        </div>
        <motion.svg
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="overflow-x-auto">
                <div className="inline-flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 pr-2 pt-4">
                    {dayNames.map((day, index) => (
                      index % 2 === 1 && (
                        <div key={day} className="h-3 text-[10px] text-slate-400 leading-3">
                          {day}
                        </div>
                      )
                    ))}
                  </div>

                  {/* Weeks */}
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day) => {
                          const dateKey = formatDateKey(day);
                          const dayData = activityMap.get(dateKey);
                          const count = dayData?.count || 0;
                          const level = getActivityLevel(count, activity.maxCount);
                          const isInRange = day >= activity.startDate && day <= activity.endDate;

                          return (
                            <button
                              key={dateKey}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (dayData && dayData.count > 0) {
                                  onDayClick?.(day, dayData.scrapIds);
                                }
                              }}
                              disabled={!isInRange || count === 0}
                              className={cn(
                                'h-3 w-3 rounded-sm transition-all',
                                isInRange ? levelColors[level] : 'bg-transparent',
                                count > 0 && 'hover:ring-2 hover:ring-indigo-500 hover:ring-offset-1 cursor-pointer',
                                count === 0 && 'cursor-default'
                              )}
                              title={isInRange ? formatTooltip(day, count) : ''}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center justify-end gap-1">
                <span className="text-[10px] text-slate-400 mr-1">Less</span>
                {([0, 1, 2, 3, 4] as ActivityLevel[]).map((level) => (
                  <div key={level} className={cn('h-3 w-3 rounded-sm', levelColors[level])} />
                ))}
                <span className="text-[10px] text-slate-400 ml-1">More</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
