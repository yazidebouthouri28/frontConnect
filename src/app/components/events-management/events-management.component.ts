import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { WorkerApplyModalComponent } from '../worker-apply-modal/worker-apply-modal.component';
import { Event } from '../../models/event.model';
import { EventServiceEntity } from '../../models/event-service-entity.model';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { CandidatureService } from '../../modules/services/services/candidature.service';

import { B2BServicePickerComponent } from '../b2b-service-picker/b2b-service-picker.component';

@Component({
  selector: 'app-events-management',
  standalone: true,
  imports: [CommonModule, EventDetailComponent, WorkerApplyModalComponent, B2BServicePickerComponent, DecimalPipe],
  templateUrl: './events-management.component.html',
  styleUrls: ['./events-management.component.css'],
})
export class EventsManagementComponent implements OnInit {
  selectedEvent: Event | null = null;
  events: Event[] = [];
  recommendedEvents: Event[] = [];

  // Modal State
  isApplyModalOpen = false;
  isB2BPickerOpen = false;
  modalEvent: Event | null = null;
  modalService: any | null = null;

  constructor(
    private eventService: EventService,
    public userService: UserService,
    private candidatureService: CandidatureService
  ) { }

  ngOnInit() {
    this.eventService.getEvents().subscribe(data => {
      this.events = data;
      this.recommendedEvents = data.slice(0, 2);
    });
  }

  eventTypeClass(type: string): string {
    const map: Record<string, string> = {
      workshop: 'bg-blue-100 text-blue-700',
      trip: 'bg-green-100 text-green-700',
      festival: 'bg-purple-100 text-purple-700',
    };
    return map[type] ?? '';
  }

  progressPercent(e: Event): number {
    return (e.participants / e.maxParticipants) * 100;
  }

  selectEvent(event: Event) {
    this.selectedEvent = event;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSelection() {
    this.selectedEvent = null;
  }

  isWorker(): boolean {
    return this.userService.isParticipant();
  }

  isOrganizer(): boolean {
    return this.userService.isOrganizer();
  }

  openApplyModal(event: Event, service?: EventServiceEntity) {
    this.modalEvent = event;
    // If service not provided, worker might just want to "Join" (we can handle default or selection)
    // Here we assume service is required as per user request "choisir les services"
    this.modalService = service || (event.requestedServices && event.requestedServices[0]) || null;
    this.isApplyModalOpen = true;
  }

  closeApplyModal() {
    this.isApplyModalOpen = false;
    this.modalEvent = null;
    this.modalService = null;
  }

  openB2BPicker(event: Event) {
    this.modalEvent = event;
    this.isB2BPickerOpen = true;
  }

  closeB2BPicker() {
    this.isB2BPickerOpen = false;
    this.modalEvent = null;
    this.refreshEvents();
  }

  refreshEvents() {
    this.eventService.getEvents().subscribe(data => {
      this.events = data;
      this.recommendedEvents = data.slice(0, 2);
      if (this.selectedEvent) {
        this.selectedEvent = this.events.find(e => e.id === this.selectedEvent?.id) || null;
      }
    });
  }

  handleApplySubmission(data: { motivation: string }) {
    if (this.modalEvent && this.modalService) {
      const candidature = {
        eventId: this.modalEvent.id,
        serviceId: this.modalService.id,
        motivation: data.motivation,
        status: 'PENDING' as const,
        appliedDate: new Date()
      };

      this.candidatureService.apply(candidature).subscribe({
        next: () => {
          alert('Application submitted successfully!');
          this.closeApplyModal();
        },
        error: (err) => {
          console.error('Application failed', err);
          alert('Failed to submit application. Please try again.');
        }
      });
    }
  }
}
