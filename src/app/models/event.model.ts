import { EventServiceEntity } from './event-service-entity.model';

export interface Event {
    id: number;
    title: string;
    type: 'workshop' | 'trip' | 'festival';
    date: string;
    time: string;
    location: string;
    image: string;
    participants: number;
    maxParticipants: number;
    price: number; // Ticket price for attendees
    organizer: string;
    description?: string;
    sponsors?: string[];
    features?: string[];
    requestedServices?: EventServiceEntity[];
}
