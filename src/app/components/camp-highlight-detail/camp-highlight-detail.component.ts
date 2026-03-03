import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CampHighlight } from '../../models/camping.models';
import { CampHighlightService } from '../../services/camp-highlight.service';
import { AuthService } from '../../services/auth.service';

interface HighlightFeedback {
  id: number;
  userName: string;
  comment: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

@Component({
  selector: 'app-camp-highlight-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './camp-highlight-detail.component.html',
  styleUrls: ['./camp-highlight-detail.component.css']
})
export class CampHighlightDetailComponent implements OnInit {
  siteId = 0;
  highlightId = 0;
  highlight: CampHighlight | null = null;
  isLoading = true;
  errorMessage = '';
  feedbackDraft = '';
  feedbackError = '';
  feedbacks: HighlightFeedback[] = [];
  private readonly feedbackStoragePrefix = 'camp_highlight_feedback_';

  constructor(
    private route: ActivatedRoute,
    private highlightService: CampHighlightService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.siteId = Number(params.get('siteId') || 0);
      this.highlightId = Number(params.get('highlightId') || 0);

      if (!this.highlightId) {
        this.errorMessage = 'Invalid highlight identifier.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.loadHighlight(this.highlightId);
    });
  }

  private loadHighlight(highlightId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.highlight = null;

    this.highlightService.getHighlightById(highlightId).subscribe({
      next: (highlight) => {
        this.highlight = highlight;
        if (!this.siteId && highlight.siteId) {
          this.siteId = highlight.siteId;
        }
        this.loadFeedbacks();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.message || 'Unable to load camp highlight details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get canReview(): boolean {
    return this.authService.isAuthenticated() && !this.authService.isAdmin();
  }

  get showReviewLoginHint(): boolean {
    return !this.authService.isAuthenticated();
  }

  isVideoMedia(mediaUrl?: string): boolean {
    if (!mediaUrl) return false;
    if (mediaUrl.startsWith('data:')) {
      return mediaUrl.startsWith('data:video/');
    }
    const normalized = mediaUrl.split('?')[0].toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v)$/.test(normalized);
  }

  submitFeedback(): void {
    if (!this.canReview || !this.highlightId) return;

    const comment = this.feedbackDraft.trim();
    if (!comment) {
      this.feedbackError = 'Please write a comment.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const userName = currentUser?.name || currentUser?.username || 'Guest';

    const feedback: HighlightFeedback = {
      id: Date.now(),
      userName,
      comment,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString()
    };

    this.feedbacks = [feedback, ...this.feedbacks];
    this.feedbackDraft = '';
    this.feedbackError = '';
    this.persistFeedbacks();
  }

  likeFeedback(feedbackId: number): void {
    const target = this.feedbacks.find((feedback) => feedback.id === feedbackId);
    if (!target) return;
    target.likes += 1;
    this.persistFeedbacks();
  }

  dislikeFeedback(feedbackId: number): void {
    const target = this.feedbacks.find((feedback) => feedback.id === feedbackId);
    if (!target) return;
    target.dislikes += 1;
    this.persistFeedbacks();
  }

  private getFeedbackStorageKey(): string {
    return `${this.feedbackStoragePrefix}${this.highlightId}`;
  }

  private loadFeedbacks(): void {
    if (typeof window === 'undefined' || !this.highlightId) {
      this.feedbacks = [];
      return;
    }

    try {
      const raw = localStorage.getItem(this.getFeedbackStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      this.feedbacks = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.feedbacks = [];
    }
  }

  private persistFeedbacks(): void {
    if (typeof window === 'undefined' || !this.highlightId) return;
    try {
      localStorage.setItem(this.getFeedbackStorageKey(), JSON.stringify(this.feedbacks));
    } catch {
      // Best effort persistence only.
    }
  }
}
