import { publicApi, type Activity } from "@/lib/publicApi";

export type AboutStatsSnapshot = {
  activityCount: number;
  destinationCount: number;
  /** Weighted by review count when available; otherwise simple mean of activities with a rating. */
  averageRating: number | null;
};

function computeAverageRating(activities: Activity[]): number | null {
  let weightedSum = 0;
  let reviewWeight = 0;
  for (const a of activities) {
    const r = a.ratingAverage;
    const c = a.reviewCount ?? 0;
    if (r != null && r > 0 && c > 0) {
      weightedSum += r * c;
      reviewWeight += c;
    }
  }
  if (reviewWeight > 0) {
    return Math.round((weightedSum / reviewWeight) * 10) / 10;
  }
  const rated = activities.filter((a) => (a.ratingAverage ?? 0) > 0);
  if (rated.length === 0) return null;
  const mean = rated.reduce((s, a) => s + (a.ratingAverage ?? 0), 0) / rated.length;
  return Math.round(mean * 10) / 10;
}

/** Fetches catalog totals and computes aggregate rating from all published activities. */
export async function fetchAboutStats(lang: string): Promise<AboutStatsSnapshot> {
  const [a0, d0] = await Promise.all([
    publicApi.getActivities(0, 1, lang),
    publicApi.getDestinations(0, 1, lang),
  ]);

  const activityCount = a0.totalElements;
  const destinationCount = d0.totalElements;

  const all: Activity[] = [];
  const pageSize = 100;
  let page = 0;
  while (all.length < activityCount && page < 100) {
    const p = await publicApi.getActivities(page, pageSize, lang);
    all.push(...p.content);
    if (p.content.length === 0) break;
    page++;
  }

  return {
    activityCount,
    destinationCount,
    averageRating: computeAverageRating(all),
  };
}
