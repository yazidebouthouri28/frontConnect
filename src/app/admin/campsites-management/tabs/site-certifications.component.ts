import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificationService } from '../../../services/certification.service';
import { Certification, CertificationItem } from '../../../models/camping.models';

@Component({
  selector: 'app-site-certifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-black text-[#1a2e1a]">Official Certifications</h3>
          <p class="text-xs text-[#617152] font-medium">Verify safety, cleanliness, and service standards.</p>
        </div>
        <button (click)="createNewCertification()" class="px-4 py-2 bg-[#2C4A3C] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#1a2e1a] transition-all">
          New Audit
        </button>
      </div>

      <div *ngFor="let cert of certifications" class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 bg-gray-50/50 flex justify-between items-center border-b border-gray-100">
           <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" [ngClass]="getStatusBg(cert.status)">
                {{ cert.status === 'APPROVED' ? '🏆' : cert.status === 'REJECTED' ? '❌' : '⏳' }}
              </div>
              <div>
                <p class="text-sm font-black text-[#1a2e1a]">Audit Score: {{ cert.score }}/100</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Expires: {{ (cert.expirationDate || cert.expiryDate) | date:'mediumDate' }}</p>
              </div>
           </div>
           <div class="flex items-center gap-2">
              <select (change)="updateStatus(cert.id, $event)" [value]="cert.status" class="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none">
                 <option value="PENDING">PENDING</option>
                 <option value="APPROVED">APPROVED</option>
                 <option value="REJECTED">REJECTED</option>
              </select>
              <button (click)="deleteCertification(cert.id)" title="Delete Certification"
                class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                🗑️
              </button>
           </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div *ngFor="let item of cert.items" class="p-4 bg-gray-50 rounded-xl relative">
              <span class="absolute top-4 right-4 text-xs font-black text-[#2C4A3C]">{{ item.score }}/10</span>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ item.criteriaName }}</p>
              <p class="text-xs text-[#1a2e1a] font-bold line-clamp-1">{{ item.comment }}</p>
            </div>
            <button (click)="selectedCertId = cert.id" class="p-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all">
              + Add Audit Criteria
            </button>
          </div>
        </div>
      </div>

      <!-- Add Criteria Modal -->
      <div *ngIf="selectedCertId" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <h2 class="text-xl font-bold text-[#1a2e1a]">Evaluation Item</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Criteria</label>
              <select [(ngModel)]="newItem.criteriaName" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
                <option value="SAFETY">Safety</option>
                <option value="CLEANLINESS">Cleanliness</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="SERVICES">Services</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Score (0-10)</label>
              <input type="number" [(ngModel)]="newItem.score" max="10" min="0" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Inspector Comment</label>
              <textarea [(ngModel)]="newItem.comment" rows="2" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button (click)="selectedCertId = null" class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
            <button (click)="addItem()" class="px-6 py-2 bg-[#2C4A3C] text-white rounded-lg text-sm font-bold">Add Item</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SiteCertificationsComponent implements OnInit, OnChanges {
  @Input() siteId!: number;
  certifications: Certification[] = [];
  selectedCertId: number | null = null;
  newItem: Partial<CertificationItem> = { criteriaName: 'SAFETY', score: 0 };

  constructor(private certService: CertificationService) { }

  ngOnInit() {
    this.loadCertifications();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['siteId'] && !changes['siteId'].firstChange) {
      this.loadCertifications();
    }
  }

  loadCertifications() {
    if (!this.siteId) {
      this.certifications = [];
      return;
    }
    this.certService.getCertificationsBySite(this.siteId).subscribe(c => this.certifications = c);
  }

  createNewCertification() {
    const cert: Partial<Certification> = {
      title: 'Campsite Annual Audit',
      issuingOrganization: 'ConnectCamp Inspection Unit',
      status: 'PENDING',
      score: 0,
      issueDate: new Date(),
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };
    this.certService.createCertification(this.siteId, cert).subscribe(() => this.loadCertifications());
  }

  updateStatus(id: number, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.certService.updateCertificationStatus(id, status).subscribe(() => this.loadCertifications());
  }

  deleteCertification(id: number) {
    if (confirm('Permanently delete this certification?')) {
      this.certService.deleteCertification(id).subscribe(() => this.loadCertifications());
    }
  }

  addItem() {
    if (this.selectedCertId && this.newItem.criteriaName) {
      const item = {
        ...this.newItem,
        name: `${this.newItem.criteriaName} check`,
        requiredScore: 7,
        certificationId: this.selectedCertId
      } as CertificationItem;
      this.certService.addCertificationItem(item).subscribe(() => {
        this.loadCertifications();
        this.selectedCertId = null;
        this.newItem = { criteriaName: 'SAFETY', score: 0 };
      });
    }
  }

  getStatusBg(status: string) {
    return {
      'bg-green-100': status === 'APPROVED' || status === 'CERTIFIED',
      'bg-red-100': status === 'REJECTED',
      'bg-orange-100': status === 'PENDING'
    };
  }
}
