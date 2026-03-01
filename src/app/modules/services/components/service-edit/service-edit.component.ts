import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';

@Component({
    selector: 'app-service-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: '../service-create/service-create.component.html', // Re-using the same template
    styleUrls: ['../service-create/service-create.component.css']
})
export class ServiceEditComponent implements OnInit {
    serviceForm: FormGroup;
    loading = false;
    submitted = false;
    errorMessage = '';
    serviceId!: number;
    imagePreview: string | null = null;

    serviceTypes = [
        { value: 'ACCOMMODATION', label: 'Hébergement' },
        { value: 'CATERING', label: 'Restauration' },
        { value: 'TRANSPORT', label: 'Transport' },
        { value: 'SECURITY', label: 'Sécurité' },
        { value: 'MEDICAL', label: 'Médical' },
        { value: 'ENTERTAINMENT', label: 'Divertissement' },
        { value: 'GUIDE', label: 'Guide Touristique' },
        { value: 'OTHER', label: 'Autre' }
    ];

    constructor(
        private fb: FormBuilder,
        private serviceService: ServiceService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.serviceForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.maxLength(500)]],
            price: [0, [Validators.required, Validators.min(0)]],
            type: ['', Validators.required],
            available: [true],
            campingId: [null]
        });
    }

    ngOnInit(): void {
        this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.serviceId) {
            this.loadService();
        }
    }

    loadService(): void {
        this.loading = true;
        this.serviceService.getById(this.serviceId).subscribe({
            next: (service) => {
                this.serviceForm.patchValue(service);
                if (service.images && service.images.length > 0) {
                    this.imagePreview = service.images[0];
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading service', err);
                this.errorMessage = 'Could not load service data.';
                this.loading = false;
            }
        });
    }
    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            // Check size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                this.errorMessage = 'L\'image dépasse la taille maximale (2 MB).';
                return;
            }

            this.errorMessage = '';
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.serviceForm.invalid) {
            return;
        }

        this.loading = true;

        const payload = { ...this.serviceForm.value };
        if (this.imagePreview) {
            payload.images = [this.imagePreview];
        }

        this.serviceService.update(this.serviceId, payload).subscribe({
            next: () => {
                this.loading = false;
                if (this.router.url.includes('/admin')) this.router.navigate(['/admin']);
                else this.router.navigate(['/services/list']);
            },
            error: (err) => {
                console.error('Error updating service', err);
                this.errorMessage = 'Failed to update service.';
                this.loading = false;
            }
        });
    }

    goBack(): void {
        if (this.router.url.includes('/admin')) Object.assign(this.router.navigate(['/admin']));
        else this.router.navigate(['/services/list']);
    }
}
