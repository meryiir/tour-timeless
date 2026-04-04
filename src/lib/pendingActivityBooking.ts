const STORAGE_KEY = "tourisme.pendingActivityBooking.v1";

export type PendingActivityBookingDraft = {
  activitySlug: string;
  travelDate: string | null;
  numberOfPeople: number;
  specialRequest: string;
  tourType: "private" | "shared";
  comfortLevel: "standard" | "luxury";
};

export function savePendingActivityBookingDraft(draft: PendingActivityBookingDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

/** Reads and removes the draft if it matches the current activity slug. */
export function consumePendingActivityBookingDraft(activitySlug: string): PendingActivityBookingDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingActivityBookingDraft;
    if (parsed?.activitySlug !== activitySlug) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return parsed;
  } catch {
    return null;
  }
}
