import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Event } from '../../models/event.model';
import { EventServiceEntity } from '../../models/event-service-entity.model';

@Component({
  selector: 'app-worker-apply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-forest/40 backdrop-blur-[12px] animate-in fade-in duration-500">
      <div class="bg-white/90 backdrop-blur-md w-full max-w-xl rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden border border-white/50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        
        <!-- Premium Header Area -->
        <div class="relative h-48 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200" 
               class="w-full h-full object-cover saturate-[1.2] brightness-75 scale-110">
          <div class="absolute inset-0 bg-gradient-to-b from-forest/30 via-forest/60 to-forest"></div>
          
          <button (click)="onClose()" 
                  class="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-90 z-20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="absolute bottom-8 left-10 z-10">
            <span class="text-sage font-black text-[9px] uppercase tracking-[0.4em] mb-2 block">Application Portal</span>
            <h2 class="text-4xl font-black text-white tracking-tight italic">Join the Mission</h2>
          </div>
        </div>

        <!-- Scrollable Content Body -->
        <div class="p-10 space-y-10">
          <!-- Recap Section -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-6 bg-forest/[0.03] rounded-[2rem] border border-forest/5 flex flex-col items-center text-center">
              <span class="text-[9px] font-black text-forest/30 uppercase tracking-widest mb-3">Service Role</span>
              <p class="font-black text-forest text-lg italic leading-tight">{{ service?.name }}</p>
            </div>
            <div class="p-6 bg-sage/[0.05] rounded-[2rem] border border-sage/10 flex flex-col items-center text-center">
              <span class="text-[9px] font-black text-sage/60 uppercase tracking-widest mb-3">Compensation</span>
              <p class="font-black text-forest text-2xl tracking-tighter">{{ service?.price }} <span class="text-sm font-bold text-gray-400">DT</span></p>
            </div>
          </div>

          <!-- Form Area -->
          <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <label class="text-[10px] font-black text-forest uppercase tracking-widest">Personal Statement</label>
              <span class="text-[9px] font-bold text-olive/40 italic">Showcase your expert skills</span>
            </div>
            <div class="relative group">
              <textarea [(ngModel)]="motivation" rows="5" 
                class="w-full bg-white border-2 border-forest/5 rounded-[2.5rem] p-8 text-forest font-medium placeholder:text-gray-300 focus:border-olive focus:bg-gray-50/50 transition-all duration-500 outline-none resize-none shadow-inner"
                placeholder="Briefly describe why you're the perfect fit for this experience..."></textarea>
              <div class="absolute bottom-6 right-8 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span class="text-[10px] font-bold text-olive italic">Drafting...</span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex gap-4 pt-4">
            <button (click)="onSubmit()" [disabled]="!motivation.trim()"
              class="flex-[3] relative group overflow-hidden bg-forest text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl shadow-forest/20 disabled:opacity-30 disabled:grayscale">
              <span class="relative z-10">Submit Application</span>
              <div class="absolute inset-0 bg-gradient-to-r from-olive to-forest translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class WorkerApplyModalComponent {
  @Input() event: Event | null = null;
  @Input() service: EventServiceEntity | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<{ motivation: string }>();

  motivation: string = '';

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.motivation.trim()) {
      this.apply.emit({ motivation: this.motivation });
      this.motivation = '';
    }
  }
}
