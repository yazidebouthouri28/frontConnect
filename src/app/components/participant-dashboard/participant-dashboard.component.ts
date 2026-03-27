import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ParticipantService } from '../../services/participant.service';
import { CandidatureService } from '../../services/candidature.service';
import { EventService } from '../../services/event.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-participant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './participant-dashboard.component.html',
  styleUrls: ['./participant-dashboard.component.css']
})
export class ParticipantDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private participantService = inject(ParticipantService);
  private candidatureService = inject(CandidatureService);
  private eventService = inject(EventService);
  @Output() onSectionChange = new EventEmitter<string>();

  joinedEvents: any[] = [];
  candidatures: any[] = [];
  availableEvents: any[] = [];
  groupedExcursionData: any[] = [];
  isLoading = true;
  apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    
    // Fetch joined events
    this.participantService.getMyEvents(Number(user.id)).subscribe({
      next: (res) => {
        this.joinedEvents = res.data || res;
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    // Fetch staff applications (candidatures)
    this.candidatureService.getByUser(Number(user.id)).subscribe({
      next: (res) => {
        this.candidatures = res.data || res;
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.eventService.getEvents().subscribe({
      next: (res) => {
        const allEvents = res;
        // Map and resolve images
        this.availableEvents = allEvents
          .map((e: any) => ({
            ...e,
            resolvedImage: this.resolveImagePath(e.images && e.images.length > 0 ? e.images[0] : (e.image || e.thumbnail))
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6); // Just top 6 recent
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  resolveImagePath(path: string | undefined): string {
    if (!path) return 'assets/placeholder-event.jpg';
    if (path.startsWith('http') || path.startsWith('blob') || path.startsWith('data:')) return path;

    const baseUrl = this.apiUrl.endsWith('/api') ? this.apiUrl.slice(0, -4) : this.apiUrl;
    
    // Remove redundant 'uploads/' or leading '/' to standardize
    const cleanPath = path.replace(/^uploads\//, '').replace(/^\//, '');
    
    // ALWAYS force /uploads/ prefix for relative server files
    return `${baseUrl}/uploads/${cleanPath}`;
  }

  handleImageError(event: any) {
    event.target.src = 'assets/placeholder-event.jpg';
  }

  private checkLoading() {
    this.isLoading = false;
    this.groupData();
  }

  private groupData() {
    const eventMap = new Map<number, any>();

    // Add joined events (Admission)
    this.joinedEvents.forEach(evt => {
      const eid = evt.eventId;
      if (!eventMap.has(eid)) {
        eventMap.set(eid, { 
          eventId: eid, 
          eventName: evt.eventName, 
          registration: evt,
          candidature: null,
          image: this.resolveImagePath(evt.eventImage || evt.image)
        });
      }
    });

    // Add candidatures (Staff)
    this.candidatures.forEach(cand => {
      const eid = cand.eventId;
      if (eventMap.has(eid)) {
        eventMap.get(eid).candidature = cand;
        if (!eventMap.get(eid).image) {
           eventMap.get(eid).image = this.resolveImagePath(cand.eventImage || cand.image);
        }
      } else {
        eventMap.set(eid, { 
          eventId: eid, 
          eventName: cand.eventName, 
          registration: null, 
          candidature: cand,
          image: this.resolveImagePath(cand.eventImage || cand.image)
        });
      }
    });

    this.groupedExcursionData = Array.from(eventMap.values());
  }
}
