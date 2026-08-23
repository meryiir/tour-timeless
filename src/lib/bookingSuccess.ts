const STORAGE_KEY = "tourisme.bookingSuccess.v1";
const TTL_MS = 30 * 60 * 1000;

export type BookingSuccessSnapshot = {
  id: number;
  bookingReference: string;
  activityTitle: string;
  activitySlug?: string;
  travelDate: string;
  numberOfPeople: number;
  customerName: string;
  customerEmail: string;
  savedAt: number;
};

export type CreateBookingResponse = {
  id: number;
  bookingReference: string;
  travelDate: string;
  numberOfPeople: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  activity?: {
    title?: string;
    slug?: string;
  };
};

export function getBookingSuccessPath(lang: string): string {
  const normalized = (lang || "en").split("-")[0].toLowerCase();
  return `/booking-success?lang=${encodeURIComponent(normalized)}`;
}

export function bookingResponseToSnapshot(booking: CreateBookingResponse): BookingSuccessSnapshot {
  const first = booking.user?.firstName?.trim() ?? "";
  const last = booking.user?.lastName?.trim() ?? "";
  const customerName = [first, last].filter(Boolean).join(" ") || booking.user?.email || "";

  return {
    id: booking.id,
    bookingReference: booking.bookingReference,
    activityTitle: booking.activity?.title ?? "",
    activitySlug: booking.activity?.slug,
    travelDate: booking.travelDate,
    numberOfPeople: booking.numberOfPeople,
    customerName,
    customerEmail: booking.user?.email ?? "",
    savedAt: Date.now(),
  };
}

export function saveBookingSuccessSnapshot(snapshot: BookingSuccessSnapshot): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota / private mode
  }
}

function parseSnapshot(raw: string): BookingSuccessSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as BookingSuccessSnapshot;
    if (!parsed?.bookingReference || !parsed.savedAt) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Returns a valid recent booking snapshot without removing it (supports page refresh). */
export function getBookingSuccessSnapshot(): BookingSuccessSnapshot | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSnapshot(raw);
  } catch {
    return null;
  }
}

export function clearBookingSuccessSnapshot(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
