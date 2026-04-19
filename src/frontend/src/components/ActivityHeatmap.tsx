import { cn } from "@/lib/utils";
import type { DailyActivity } from "@/types";

interface ActivityHeatmapProps {
  data: DailyActivity[];
}

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return "bg-muted/40";
  const ratio = count / max;
  if (ratio < 0.25) return "bg-chart-2/30";
  if (ratio < 0.5) return "bg-chart-2/55";
  if (ratio < 0.75) return "bg-chart-2/75";
  return "bg-chart-2";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const max = Math.max(...data.map((d) => d.reviewCount), 1);

  // Build a 5-week grid (35 days)
  const cells = data.slice(-35);
  const weeks: DailyActivity[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div data-ocid="activity_heatmap" className="space-y-2">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-xs text-muted-foreground w-7 h-4 flex items-center leading-none"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Heatmap cells — keyed by first day of each week */}
        {weeks.map((week) => (
          <div key={week[0]?.dateKey ?? "week"} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.dateKey}
                data-ocid={`activity_heatmap.cell.${day.dateKey}`}
                title={`${day.dateKey}: ${day.reviewCount} reviews`}
                className={cn(
                  "w-4 h-4 rounded-sm transition-smooth hover:ring-1 hover:ring-primary/40",
                  getIntensityClass(day.reviewCount, max),
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className={cn(
              "w-3 h-3 rounded-sm",
              getIntensityClass(ratio * max, max),
            )}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
