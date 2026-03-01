import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';

@Component({
    selector: 'app-service-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './service-create.component.html',
    styleUrls: ['./service-create.component.css']
})
export class ServiceCreateComponent implements OnInit {
    serviceForm: FormGroup;
    loading = false;
    submitted = false;
    errorMessage = '';
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
        private router: Router
    ) {
        this.serviceForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.maxLength(500)]],
            price: [0, [Validators.required, Validators.min(0.01)]],
            type: ['', Validators.required],
            targetRole: ['USER', Validators.required],
            available: [true],
            campingId: [null]
        });
    }

    ngOnInit(): void { }

    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            // Check size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                this.errorMessage = 'L\'image dépasse la taille maximale autorisée (2 MB).';
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
        this.errorMessage = '';

        const payload = { ...this.serviceForm.value };
        if (this.imagePreview) {
            payload.images = [this.imagePreview]; // Send as first image in array, or we can use the 'image' field if preferred, but Pack/Service DTOs support `images` list.
        }

        this.serviceService.create(payload).subscribe({
            next: () => {
                this.loading = false;
                if (this.router.url.includes('/admin')) this.router.navigate(['/admin']);
                else this.router.navigate(['/services/list']);
            },
            error: (err) => {
                console.error('Error creating service', err);
                const detail = err.error?.message || err.message || 'Erreur inconnue';
                this.errorMessage = `Erreur (${err.status || '?'}) : ${detail}`;
                this.loading = false;
            }
        });
    }

    goBack(): void {
        if (this.router.url.includes('/admin')) Object.assign(this.router.navigate(['/admin']));
        else this.router.navigate(['/services/list']);
    }
}
