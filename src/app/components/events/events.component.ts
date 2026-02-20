import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/campsite.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-cream-beige py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-forest-green mb-4">Events & Workshops</h1>
        <p class="text-olive-green mb-8">Join camping events, workshops, and group trips</p>

        <!-- Filter Tabs -->
        <div class="flex gap-4 mb-8 overflow-x-auto">
          <button
            *ngFor="let type of eventTypes"
            [class.bg-forest-green]="selectedType === type"
            [class.text-cream-beige]="selectedType === type"
            [class.bg-white]="selectedType !== type"
            [class.text-forest-green]="selectedType !== type"
            (click)="selectedType = type"
            class="px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors">
            {{type}}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let event of filteredEvents"
               class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img [src]="event.image" [alt]="event.title" class="w-full h-48 object-cover" />

            <div class="p-4">
              <span [class]="getEventTypeBadge(event.type)"
                    class="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2">
                {{event.type | uppercase}}
              </span>

              <h3 class="text-lg font-bold text-forest-green mb-2">{{event.title}}</h3>

              <div class="space-y-2 text-sm text-olive-green mb-4">
                <div class="flex items-center gap-2">
                  📅 {{event.date}} • {{event.time}}
                </div>
                <div class="flex items-center gap-2">
                  📍 {{event.location}}
                </div>
                <div class="flex items-center gap-2">
                  👥 {{event.participants}}/{{event.maxParticipants}} participants
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-forest-green">\${{event.price}}</span>
                <button class="bg-forest-green text-cream-beige px-4 py-2 rounded-lg hover:bg-olive-green transition-colors">
                  Register
                </button>
              </div>

              <p class="text-xs text-olive-green mt-2">Organized by {{event.organizer}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventsComponent {
  selectedType = 'All Events';

  eventTypes = ['All Events', 'Workshops', 'Trips', 'Festivals'];

  events: Event[] = [
    {
      id: 1,
      title: 'Wilderness Survival Skills Workshop',
      type: 'workshop',
      date: 'Feb 15, 2026',
      time: '9:00 AM - 4:00 PM',
      location: 'Yosemite National Park, CA',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      participants: 18,
      maxParticipants: 25,
      price: 85,
      organizer: 'Adventure Education Co.'
    },
    {
      id: 2,
      title: 'Summer Camping Music Festival',
      type: 'festival',
      date: 'Jul 4-6, 2026',
      time: 'All Day',
      location: 'Lake Tahoe, CA',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      participants: 342,
      maxParticipants: 500,
      price: 195,
      organizer: 'Mountain Sounds Events'
    },
    {
      id: 3,
      title: 'Beginner\'s Backcountry Group Trip',
      type: 'trip',
      date: 'Mar 22-24, 2026',
      time: '3 Days / 2 Nights',
      location: 'Rocky Mountain NP, CO',
      image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800&q=80',
      participants: 8,
      maxParticipants: 12,
      price: 250,
      organizer: 'Peak Adventures'
    },
    {
      id: 4,
      title: 'Family Camping Weekend',
      type: 'trip',
      date: 'Apr 10-12, 2026',
      time: 'Weekend',
      location: 'Sequoia National Park, CA',
      image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80',
      participants: 15,
      maxParticipants: 20,
      price: 120,
      organizer: 'Family Outdoor Adventures'
    },
    {
      id: 5,
      title: 'Photography in Nature Workshop',
      type: 'workshop',
      date: 'May 5, 2026',
      time: '8:00 AM - 2:00 PM',
      location: 'Grand Canyon NP, AZ',
      image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80',
      participants: 12,
      maxParticipants: 15,
      price: 95,
      organizer: 'Outdoor Photography Academy'
    },
    {
      id: 6,
      title: 'Spring Camping Festival',
      type: 'festival',
      date: 'May 20-22, 2026',
      time: 'All Weekend',
      location: 'Zion National Park, UT',
      image: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80',
      participants: 156,
      maxParticipants: 300,
      price: 150,
      organizer: 'Spring Fest Organizers'
    }
  ];

  get filteredEvents() {
    if (this.selectedType === 'All Events') {
      return this.events;
    }
    const typeMap: {[key: string]: string} = {
      'Workshops': 'workshop',
      'Trips': 'trip',
      'Festivals': 'festival'
    };
    return this.events.filter(e => e.type === typeMap[this.selectedType]);
  }

  getEventTypeBadge(type: string): string {
    const badges: {[key: string]: string} = {
      workshop: 'bg-blue-500 text-white',
      trip: 'bg-green-500 text-white',
      festival: 'bg-purple-500 text-white'
    };
    return badges[type] || 'bg-gray-500 text-white';
  }
}
