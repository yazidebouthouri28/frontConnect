import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ForumTopic {
  id: number;
  category: string;
  title: string;
  author: string;
  avatar: string;
  timestamp: string;
  replies: number;
  likes: number;
  trending: boolean;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-cream-beige py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-forest-green mb-4">Community Forum</h1>
        <p class="text-olive-green mb-8">Connect with fellow campers, share stories, and get advice</p>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Categories Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl p-4 shadow-md sticky top-4">
              <h3 class="font-bold text-forest-green mb-4">Categories</h3>
              <div class="space-y-2">
                <button
                  *ngFor="let cat of categories"
                  [class.bg-sage-green/20]="selectedCategory === cat"
                  (click)="selectedCategory = cat"
                  class="w-full text-left px-3 py-2 rounded hover:bg-sage-green/20 text-olive-green transition-colors">
                  {{cat}}
                </button>
              </div>

              <button class="w-full mt-6 bg-forest-green text-cream-beige py-2 rounded-lg hover:bg-olive-green transition-colors">
                + New Topic
              </button>
            </div>
          </div>

          <!-- Forum Topics -->
          <div class="lg:col-span-3 space-y-4">
            <div *ngFor="let topic of filteredTopics"
                 class="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-forest-green text-cream-beige flex items-center justify-center font-bold flex-shrink-0">
                  {{topic.avatar}}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-xs bg-olive-green text-cream-beige px-2 py-1 rounded-full">
                      {{topic.category}}
                    </span>
                    <span *ngIf="topic.trending" class="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                      🔥 Trending
                    </span>
                  </div>

                  <h3 class="text-lg font-bold text-forest-green mb-2">{{topic.title}}</h3>

                  <div class="flex items-center gap-4 text-sm text-olive-green flex-wrap">
                    <span>by {{topic.author}}</span>
                    <span>•</span>
                    <span>{{topic.timestamp}}</span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      💬 {{topic.replies}} replies
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      👍 {{topic.likes}} likes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="flex justify-center gap-2 mt-8">
              <button class="px-4 py-2 bg-white rounded-lg hover:bg-sage-green/20 transition-colors">Previous</button>
              <button class="px-4 py-2 bg-forest-green text-cream-beige rounded-lg">1</button>
              <button class="px-4 py-2 bg-white rounded-lg hover:bg-sage-green/20 transition-colors">2</button>
              <button class="px-4 py-2 bg-white rounded-lg hover:bg-sage-green/20 transition-colors">3</button>
              <button class="px-4 py-2 bg-white rounded-lg hover:bg-sage-green/20 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommunityComponent {
  selectedCategory = 'All Topics';

  categories = [
    'All Topics',
    'Gear Reviews',
    'Trip Planning',
    'Campfire Stories',
    'Tips & Tricks',
    'Safety',
    'Wildlife'
  ];

  topics: ForumTopic[] = [
    {
      id: 1,
      category: 'Gear Reviews',
      title: 'Best budget-friendly tents for beginners? Looking for recommendations!',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      timestamp: '2 hours ago',
      replies: 24,
      likes: 45,
      trending: true
    },
    {
      id: 2,
      category: 'Trip Planning',
      title: 'Yosemite in July - What to expect and must-see spots?',
      author: 'Mike Chen',
      avatar: 'MC',
      timestamp: '5 hours ago',
      replies: 18,
      likes: 32,
      trending: true
    },
    {
      id: 3,
      category: 'Campfire Stories',
      title: 'Our unexpected encounter with wildlife at Yellowstone',
      author: 'Emma Wilson',
      avatar: 'EW',
      timestamp: '1 day ago',
      replies: 56,
      likes: 89,
      trending: true
    },
    {
      id: 4,
      category: 'Tips & Tricks',
      title: 'Meal prep ideas for 5-day backcountry camping',
      author: 'James Taylor',
      avatar: 'JT',
      timestamp: '1 day ago',
      replies: 31,
      likes: 67,
      trending: false
    },
    {
      id: 5,
      category: 'Safety',
      title: 'First aid essentials every camper should carry',
      author: 'Dr. Lisa Martinez',
      avatar: 'LM',
      timestamp: '2 days ago',
      replies: 42,
      likes: 103,
      trending: false
    }
  ];

  get filteredTopics() {
    if (this.selectedCategory === 'All Topics') {
      return this.topics;
    }
    return this.topics.filter(t => t.category === this.selectedCategory);
  }
}
