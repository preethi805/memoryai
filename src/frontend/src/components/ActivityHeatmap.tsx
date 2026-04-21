import { cn } from "@/lib/utils";
import type { DailyActivity } from "@/types";

interface ActivityHeatmapProps {
  data: DailyActivity[];
}

function getIntensityClass(count: number | bigint, max: number): string {
  const c = Number(count);
  if (c === 0) return "bg-muted/30";
  const ratio = c / max;
  if (ratio < 0.25) return "bg-[oklch(0.75_0.25_265/0.25)]";
  if (ratio < 0.5) return "bg-[oklch(0.75_0.25_265/0.5)]";
  if (ratio < 0.75) return "bg-[oklch(0.75_0.25_265/0.75)]";
  return "bg-[oklch(0.75_0.25_265)] shadow-[0_0_6px_oklch(0.75_0.25_265/0.6)]";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const max = Math.max(...data.map((d) => Number(d.reviewCount)), 1);

  const cells = data.slice(-35);
  const weeks: DailyActivity[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div data-ocid="activity_heatmap" className="space-y-3">
      <div className="flex gap-1.5">
        <div className="flex flex-col gap-1.5 mr-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-xs text-muted-foreground w-7 h-4 flex items-center leading-none"
            >
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div
            key={week[0]?.dateKey?.toString() ?? "week"}
            className="flex flex-col gap-1.5"
          >
            {week.map((day) => (
              <div
                key={day.dateKey.toString()}
                data-ocid={`activity_heatmap.cell.${day.dateKey.toString()}`}
                title={`${day.dateKey}: ${Number(day.reviewCount)} reviews`}
                className={cn(
                  "w-4 h-4 rounded-sm transition-smooth hover:ring-2 hover:ring-[oklch(0.75_0.25_265/0.5)] hover:scale-110 cursor-default",
                  getIntensityClass(day.reviewCount, max),
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className={cn(
              "w-3.5 h-3.5 rounded-sm",
              getIntensityClass(ratio * max, max),
            )}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
