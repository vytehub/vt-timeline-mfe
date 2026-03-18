export type BookingStatus =
  | 'Holding'
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed'
  | 'NoShow';

export interface ProviderBookingItem {
  id: string;
  listingId: string;
  slotId: string;
  clientProfileId: string;
  status: BookingStatus;
  confirmationPolicy: 'AutoConfirm' | 'ManualConfirm';
  createdAt: string;

  // Intake
  intakeName: string;
  intakeLastName: string;
  intakeEmail: string;

  // Listing snapshot
  listingTitle: string | null;
  listingEffectivePrice: number | null;
  listingCurrency: string | null;

  // Service snapshot
  serviceName: string | null;
  serviceDurationMin: number | null;
}

export interface ProviderBookingsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  items: ProviderBookingItem[];
}

export interface BookingIntake {
  name: string;
  lastName: string;
  email: string;
}

export interface ListingSnapshot {
  listingId: string;
  providerProfileId: string;
  title: string;
  effectivePrice: number;
  currency: string;
}

export interface BookingDetail {
  id: string;
  listingId: string;
  slotId: string;
  clientProfileId: string;
  status: BookingStatus;
  confirmationPolicy: 'AutoConfirm' | 'ManualConfirm';
  holdExpiresAt: string | null;
  intake: BookingIntake;
  listingSnapshot: ListingSnapshot | null;
  assignedStaffId: string | null;
  timelineEventId: string | null;
  createdAt: string;
}

export interface BookingFilters {
  profileId: string;
  status?: BookingStatus;
  from?: string;
  to?: string;
  q?: string;
  page: number;
  pageSize: number;
}
