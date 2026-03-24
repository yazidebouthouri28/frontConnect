import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/camping.models';

@Component({
  selector: 'app-site-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-black text-[#1a2e1a]">Visitor Reviews</h3>
        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
          {{ reviews.length }} Total
        </span>
      </div>

      <div class="space-y-4">
        <div *ngFor="let review of reviews" class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-lg">
                {{ review.userAvatar || '👤' }}
              </div>
              <div>
                <p class="font-bold text-[#1a2e1a]">{{ review.userName || 'Anonymous Visitor' }}</p>
                <p class="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{{ review.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex gap-1 text-orange-400">
                <span *ngFor="let i of [1,2,3,4,5]" [class.opacity-30]="i > review.rating">⭐</span>
              </div>
              <div class="flex gap-1">
                <button (click)="startEditReview(review)" title="Edit Review"
                  class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors">
                  ✏️
                </button>
                <button (click)="deleteReview(review.id)" title="Delete Review"
                  class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          </div>
          <p class="text-sm text-[#617152] leading-relaxed italic">"{{ review.comment }}"</p>
        </div>

        <div *ngIf="reviews.length === 0" class="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p class="text-gray-400 font-bold">No reviews recorded for this site yet.</p>
        </div>
      </div>

      <!-- Edit Review Modal -->
      <div *ngIf="editingReview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <h2 class="text-xl font-bold text-[#1a2e1a]">Edit Review</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Rating (1-5)</label>
              <input type="number" [(ngModel)]="editingReview.rating" min="1" max="5"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Comment</label>
              <textarea [(ngModel)]="editingReview.comment" rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button (click)="editingReview = null" class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
            <button (click)="saveEditReview()" class="px-6 py-2 bg-[#2C4A3C] text-white rounded-lg text-sm font-bold">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SiteReviewsComponent implements OnInit, OnChanges {
  @Input() siteId!: number;
  reviews: Review[] = [];
  editingReview: Review | null = null;

  constructor(private reviewService: ReviewService) { }

  ngOnInit() {
    this.loadReviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['siteId'] && !changes['siteId'].firstChange) {
      this.loadReviews();
    }
  }

  loadReviews() {
    if (!this.siteId) {
      this.reviews = [];
      return;
    }
    this.reviewService.getReviewsBySite(this.siteId).subscribe(r => this.reviews = r);
  }

  startEditReview(review: Review) {
    this.editingReview = { ...review };
  }

  saveEditReview() {
    if (!this.editingReview) return;
    this.reviewService.updateReview(this.editingReview.id, this.siteId, this.editingReview)
      .subscribe(() => {
        this.editingReview = null;
        this.loadReviews();
      });
  }

  deleteReview(id: number) {
    if (confirm('Permanently delete this review?')) {
      this.reviewService.deleteReview(id).subscribe(() => this.loadReviews());
    }
  }
}
