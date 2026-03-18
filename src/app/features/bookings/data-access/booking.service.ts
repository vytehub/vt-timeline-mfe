import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BookingDetail,
  BookingFilters,
  ProviderBookingsResponse,
} from './models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProviderBookings(filters: BookingFilters): Observable<ProviderBookingsResponse> {
    let params = new HttpParams()
      .set('profileId', filters.profileId)
      .set('page', String(filters.page))
      .set('pageSize', String(filters.pageSize));

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.from) {
      params = params.set('from', filters.from);
    }
    if (filters.to) {
      params = params.set('to', filters.to);
    }
    if (filters.q) {
      params = params.set('q', filters.q);
    }

    return this.http.get<ProviderBookingsResponse>(`${this.apiUrl}/bookings`, { params });
  }

  getBooking(id: string): Observable<BookingDetail> {
    return this.http.get<BookingDetail>(`${this.apiUrl}/bookings/${id}`);
  }

  confirmBooking(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bookings/${id}/confirm`, {});
  }

  cancelBooking(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bookings/${id}/cancel`, {});
  }

  completeBooking(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bookings/${id}/complete`, {});
  }

  markNoShow(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bookings/${id}/no-show`, {});
  }

  rejectBooking(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bookings/${id}/reject`, {});
  }
}
