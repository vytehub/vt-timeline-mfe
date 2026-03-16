import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GetTimelineResponse, ConflictRule } from './models/timeline.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTimeline(weekStart?: string): Observable<GetTimelineResponse> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('weekStart', weekStart);
    }
    return this.http.get<GetTimelineResponse>(`${this.apiUrl}/timeline`, { params });
  }

  getConflictRules(): Observable<ConflictRule[]> {
    return this.http.get<ConflictRule[]>(`${this.apiUrl}/timeline/rules`);
  }
}
