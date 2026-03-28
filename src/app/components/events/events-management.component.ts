import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { EventDetailComponent, Event } from '../event-detail/event-detail.component';
import { environment } from '../../../environments/environment';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
};

type EventResponse = {
  id: number;
  title: string;
  description?: string;
  eventType?: string;
  category?: string;
  startDate: string; // LocalDateTime serialized
  endDate?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  isFree?: boolean;
  images?: string[];
  thumbnail?: string;
  organizerName?: string;
  status?: string;
};

@Component({
  selector: 'app-events-management',
  standalone: true,
  imports: [CommonModule, EventDetailComponent, HttpClientModule],
  templateUrl: './events-management.component.html',
  styleUrls: ['./events-management.component.css'],
})
export class EventsManagementComponent implements OnInit {
  private readonly API_BASE = environment.apiUrl;
  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1080';

  selectedEvent: Event | null = null;

  loading = false;
  errorMessage = '';

  events: Event[] = [];
  recommendedEvents: Event[] = [];

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<ApiResponse<EventResponse[]>>(`${this.API_BASE}/api/events`)
      .pipe(
        map((res) => {
          if (!res?.success) {
            throw new Error(res?.message || 'Failed to load events');
          }
          return (res.data ?? []).map((e) => this.toUiEvent(e));
        }),
        catchError((err) => {
          const msg =
            err?.error?.message ||
            err?.message ||
            'Unable to load events. Make sure backend is running.';
          this.errorMessage = msg;
          this.loading = false;
          return of([] as Event[]);
        })
      )
      .subscribe((list) => {
        this.events = list;

        // Simple recommendation: first two upcoming by date
        const sorted = [...list].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.recommendedEvents = sorted.slice(0, 2);

        this.loading = false;
      });
  }

  private toUiEvent(e: EventResponse): Event {
    const start = e.startDate ? new Date(e.startDate) : null;
    const primaryImage = e.thumbnail || e.images?.find((img) => !!img);

    const type: 'workshop' | 'trip' | 'festival' = this.normalizeEventType(
      e.eventType ?? e.category
    );

    return {
      id: e.id,
      title: e.title,
      type,
      date: start ? start.toDateString() : 'N/A',
      time: e.endDate ? 'Scheduled' : 'TBA',
      location: e.location || 'Unknown location',
      image: this.resolveMediaUrl(primaryImage),
      participants: e.currentParticipants ?? 0,
      maxParticipants: e.maxParticipants ?? 1,
      price: e.isFree ? 0 : e.price ?? 0,
      organizer: e.organizerName || 'Organizer',
      images: (e.images ?? []).map((img) => this.resolveMediaUrl(img)),
    };
  }

  private normalizeEventType(raw?: string): 'workshop' | 'trip' | 'festival' {
    const v = (raw ?? '').toLowerCase();

    if (v.includes('workshop') || v.includes('atelier') || v.includes('training')) return 'workshop';
    if (v.includes('festival') || v.includes('music')) return 'festival';

    return 'trip';
  }

  private resolveMediaUrl(path?: string): string {
    if (!path) {
      return this.fallbackImage;
    }

    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:') ||
      path.startsWith('blob:')
    ) {
      return path;
    }

    if (path.startsWith('/uploads/')) {
      return `${this.API_BASE}${path}`;
    }

    return `${this.API_BASE}/uploads/${path}`;
  }

  progressPercent(ev: Event): number {
    if (!ev.maxParticipants || ev.maxParticipants <= 0) return 0;
    return (ev.participants / ev.maxParticipants) * 100;
  }

  selectEvent(event: Event) {
    this.selectedEvent = event;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSelection() {
    this.selectedEvent = null;
  }
}
