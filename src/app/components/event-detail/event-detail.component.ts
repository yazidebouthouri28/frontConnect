import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event.model';
import { EventServiceEntity } from '../../models/event-service-entity.model';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-event-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent {
    @Input() event: Event | null = null;
    @Output() back = new EventEmitter<void>();
    @Output() apply = new EventEmitter<{ event: Event, service: EventServiceEntity }>();

    constructor(private userService: UserService) { }

    get progressPercent(): number {
        if (!this.event) return 0;
        return (this.event.participants / this.event.maxParticipants) * 100;
    }

    onBack() {
        this.back.emit();
    }

    onApply(service: EventServiceEntity) {
        if (this.event) {
            this.apply.emit({ event: this.event, service });
        }
    }

    getServicePlaceholderImage(serviceName: string): string {
        const name = serviceName.toLowerCase();
        if (name.includes('guide') || name.includes('hiking'))
            return 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800';
        if (name.includes('security') || name.includes('guard'))
            return 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=800';
        if (name.includes('cook') || name.includes('food') || name.includes('catering'))
            return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800';
        if (name.includes('photo') || name.includes('video'))
            return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800';
        if (name.includes('music') || name.includes('dj') || name.includes('sound'))
            return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800';
        if (name.includes('medical') || name.includes('first aid') || name.includes('nurse'))
            return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800';
        if (name.includes('clean') || name.includes('maintenance'))
            return 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?q=80&w=800';

        return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800'; // Default wilderness
    }

    isWorker(): boolean {
        return this.userService.isParticipant();
    }

    isOrganizer(): boolean {
        return this.userService.isOrganizer();
    }
}
