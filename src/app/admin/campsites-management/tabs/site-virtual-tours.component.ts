import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualTourService } from '../../../services/virtual-tour.service';
import { VirtualTour, Scene360 } from '../../../models/camping.models';

@Component({
  selector: 'app-site-virtual-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-black text-[#1a2e1a]">Virtual Experiences</h3>
          <p class="text-xs text-[#617152] font-medium">Create 360° panoramic tours for this campsite.</p>
        </div>
        <button (click)="openCreateTourForm()" class="px-4 py-2 bg-[#2C4A3C] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#1a2e1a] transition-all">
          New Tour
        </button>
      </div>

      <p *ngIf="loadError" class="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {{ loadError }}
      </p>

      <div *ngFor="let tour of tours" class="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div class="flex justify-between items-center border-b border-gray-200 pb-4">
          <h4 class="font-black text-[#1a2e1a] flex items-center gap-2">
            <span class="text-xl">🌐</span> {{ tour.title }}
          </h4>
          <div class="flex items-center gap-2">
            <button (click)="startEditTour(tour)" title="Edit Tour"
              class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors">
              ✏️
            </button>
            <button (click)="deleteTour(tour.id)" title="Delete Tour"
              class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
              🗑️
            </button>
            <button (click)="selectedTour = tour" class="text-xs font-black text-emerald-600 uppercase tracking-widest ml-2">+ Add Scene</button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let scene of tour.scenes" class="relative group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div class="h-24 bg-gray-200">
               <img [src]="scene.panoramaUrl" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
            </div>
            <div class="p-3 flex justify-between items-start">
              <div>
                <p class="text-[10px] font-black text-[#1a2e1a] truncate">{{ scene.name }}</p>
                <p class="text-[8px] text-gray-400 uppercase font-black tracking-tighter">Order: {{ scene.sceneOrder }}</p>
              </div>
              <button (click)="deleteScene(scene.id)" title="Delete Scene"
                class="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Tour Modal -->
      <div *ngIf="showCreateTour" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <h2 class="text-xl font-bold text-[#1a2e1a]">New Virtual Tour</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tour Title</label>
              <input [(ngModel)]="createTourForm.title" placeholder="Ex: Forest Trail Sunset"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
              <textarea [(ngModel)]="createTourForm.description" rows="2"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                placeholder="Short description for this 360° experience"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Thumbnail (optional)</label>
              <div class="flex items-center gap-3">
                <input #tourThumbInput type="file" accept="image/*" class="hidden"
                  (change)="onTourThumbnailSelected($event)">
                <button type="button" (click)="tourThumbInput.click()"
                  class="px-4 py-2 bg-[#2C4A3C] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#1a2e1a] transition-all">
                  + Import Thumbnail
                </button>
                <span class="text-xs text-[#617152] font-bold" *ngIf="createTourForm.thumbnailUrl">
                  Image selected
                </span>
                <span class="text-xs text-gray-400 font-bold" *ngIf="!createTourForm.thumbnailUrl">
                  No image selected
                </span>
              </div>
              <div *ngIf="createTourForm.thumbnailUrl"
                class="mt-3 inline-block relative rounded-xl overflow-hidden border border-gray-200 bg-white">
                <img [src]="createTourForm.thumbnailUrl" alt="Tour thumbnail preview" class="w-40 h-24 object-cover">
                <button type="button" (click)="clearTourThumbnail()"
                  class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-black">
                  x
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Duration (minutes)</label>
              <input type="number" min="0" [(ngModel)]="createTourForm.durationMinutes"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
            <div class="flex items-center gap-2">
              <input id="featuredTour" type="checkbox" [(ngModel)]="createTourForm.isFeatured">
              <label for="featuredTour" class="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Mark as featured
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button (click)="closeCreateTourForm()"
              class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
            <button (click)="createNewTour()" [disabled]="isCreatingTour"
              class="px-6 py-2 bg-[#2C4A3C] text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isCreatingTour ? 'Creating...' : 'Create Tour' }}
            </button>
          </div>
          <p *ngIf="tourActionError" class="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ tourActionError }}
          </p>
        </div>
      </div>

      <!-- Edit Tour Modal -->
      <div *ngIf="editingTour" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <h2 class="text-xl font-bold text-[#1a2e1a]">Edit Tour</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tour Title</label>
              <input [(ngModel)]="editingTour.title" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
              <textarea [(ngModel)]="editingTour.description" rows="2" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button (click)="editingTour = null" class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
            <button (click)="saveEditTour()" class="px-6 py-2 bg-[#2C4A3C] text-white rounded-lg text-sm font-bold">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Add Scene Modal -->
      <div *ngIf="selectedTour" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <h2 class="text-xl font-bold text-[#1a2e1a]">New 360° Scene</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Scene Name</label>
              <input [(ngModel)]="newScene.name" placeholder="Ex: Entrance, Lake View..." class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Panorama (360° Image)</label>
              <div class="flex items-center gap-3">
                <input #sceneImageInput type="file" accept="image/*" class="hidden"
                  (change)="onScenePanoramaSelected($event)">
                <button type="button" (click)="sceneImageInput.click()"
                  class="px-4 py-2 bg-[#2C4A3C] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#1a2e1a] transition-all">
                  + Import Panorama
                </button>
                <span class="text-xs text-[#617152] font-bold" *ngIf="newScene.panoramaUrl">
                  Image selected
                </span>
                <span class="text-xs text-gray-400 font-bold" *ngIf="!newScene.panoramaUrl">
                  No image selected
                </span>
              </div>
              <div *ngIf="newScene.panoramaUrl"
                class="mt-3 inline-block relative rounded-xl overflow-hidden border border-gray-200 bg-white">
                <img [src]="newScene.panoramaUrl" alt="Scene preview" class="w-40 h-24 object-cover">
                <button type="button" (click)="clearScenePanorama()"
                  class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-black">
                  x
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Display Order</label>
              <input type="number" [(ngModel)]="newScene.sceneOrder" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button (click)="selectedTour = null" class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
            <button (click)="addScene()" class="px-6 py-2 bg-[#2C4A3C] text-white rounded-lg text-sm font-bold">Add Scene</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SiteVirtualToursComponent implements OnInit, OnChanges {
  @Input() siteId!: number;
  tours: VirtualTour[] = [];
  loadError = '';
  tourActionError = '';
  isCreatingTour = false;
  selectedTour: VirtualTour | null = null;
  editingTour: VirtualTour | null = null;
  newScene: Partial<Scene360> = { sceneOrder: 0 };
  showCreateTour = false;
  createTourForm: Partial<VirtualTour> = {};

  constructor(private tourService: VirtualTourService) { }

  ngOnInit() {
    this.loadTours();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['siteId'] && !changes['siteId'].firstChange) {
      this.loadTours();
    }
  }

  loadTours() {
    if (!this.siteId) {
      this.tours = [];
      this.loadError = '';
      return;
    }
    this.tourService.getToursBySite(this.siteId).subscribe({
      next: (tours) => {
        this.tours = tours;
        this.loadError = '';
      },
      error: (error) => {
        this.tours = [];
        this.loadError = error?.message || 'Unable to load virtual tours.';
      }
    });
  }

  openCreateTourForm() {
    this.createTourForm = { title: '', description: '', durationMinutes: 0, isFeatured: false };
    this.tourActionError = '';
    this.isCreatingTour = false;
    this.showCreateTour = true;
  }

  closeCreateTourForm() {
    this.showCreateTour = false;
    this.tourActionError = '';
    this.isCreatingTour = false;
  }

  createNewTour() {
    const title = (this.createTourForm.title || '').trim();
    if (title.length < 3) {
      this.tourActionError = 'Tour title must contain at least 3 characters.';
      return;
    }

    if (!this.siteId) {
      this.tourActionError = 'No campsite selected for this virtual tour.';
      return;
    }

    this.tourActionError = '';
    this.isCreatingTour = true;
    this.tourService.createTour(this.siteId, { ...this.createTourForm, title }).subscribe({
      next: () => {
        this.showCreateTour = false;
        this.loadTours();
      },
      error: (error) => {
        this.tourActionError = error?.message || 'Unable to create virtual tour.';
        this.isCreatingTour = false;
      },
      complete: () => {
        this.isCreatingTour = false;
      }
    });
  }

  onTourThumbnailSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.createTourForm.thumbnailUrl = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearTourThumbnail() {
    this.createTourForm.thumbnailUrl = undefined;
  }

  startEditTour(tour: VirtualTour) {
    this.editingTour = { ...tour };
  }

  saveEditTour() {
    if (!this.editingTour) return;
    this.tourService.updateTour(this.editingTour.id, this.siteId, this.editingTour)
      .subscribe(() => {
        this.editingTour = null;
        this.loadTours();
      });
  }

  deleteTour(id: number) {
    if (confirm('Permanently delete this tour and all its scenes?')) {
      this.tourService.deleteTour(id).subscribe(() => this.loadTours());
    }
  }

  deleteScene(sceneId: number) {
    if (confirm('Delete this scene?')) {
      this.tourService.deleteScene(sceneId).subscribe(() => this.loadTours());
    }
  }

  addScene() {
    if (this.selectedTour && this.newScene.name && this.newScene.panoramaUrl) {
      const scene = {
        ...this.newScene,
        title: this.newScene.name,
        imageUrl: this.newScene.panoramaUrl,
        virtualTourId: this.selectedTour.id
      } as Scene360;
      this.tourService.createScene(scene).subscribe(() => {
        this.loadTours();
        this.selectedTour = null;
        this.newScene = { sceneOrder: 0 };
      });
    }
  }

  onScenePanoramaSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === 'string' ? reader.result : '';
      this.newScene.panoramaUrl = data;
      this.newScene.thumbnailUrl = data;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearScenePanorama() {
    this.newScene.panoramaUrl = undefined;
    this.newScene.thumbnailUrl = undefined;
  }
}
