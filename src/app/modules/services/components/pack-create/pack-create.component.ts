import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PackService } from '../../services/pack.service';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';

@Component({
    selector: 'app-pack-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './pack-create.component.html',
    styleUrls: ['./pack-create.component.css']
})
export class PackCreateComponent implements OnInit {
    packForm: FormGroup;
    services: Service[] = [];
    loading = false;
    submitted = false;
    errorMessage = '';
    imagePreview: string | null = null;

    constructor(
        private fb: FormBuilder,
        private packService: PackService,
        private serviceService: ServiceService,
        private router: Router
    ) {
        this.packForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            price: [0, [Validators.required, Validators.min(0)]],
            discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            packType: ['FAMILY', Validators.required],
            serviceIds: [[], [Validators.required, Validators.minLength(1)]],
            available: [true]
        });
    }

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        this.serviceService.getAll().subscribe({
            next: (data) => this.services = data,
            error: (err) => console.error('Error loading services', err)
        });
    }

    toggleService(id: number): void {
        const currentIds: number[] = this.packForm.get('serviceIds')?.value;
        const index = currentIds.indexOf(id);
        if (index === -1) {
            currentIds.push(id);
        } else {
            currentIds.splice(index, 1);
        }
        this.packForm.get('serviceIds')?.setValue([...currentIds]);
    }

    isServiceSelected(id: number): boolean {
        return this.packForm.get('serviceIds')?.value.includes(id);
    }

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
        if (this.packForm.invalid) return;

        this.loading = true;

        const payload = { ...this.packForm.value };
        if (this.imagePreview) {
            payload.images = [this.imagePreview];
        }

        this.packService.create(payload).subscribe({
            next: () => {
                this.loading = false;
                if (this.router.url.includes('/admin')) this.router.navigate(['/admin']);
                else this.router.navigate(['/services/packs']);
            },
            error: (err) => {
                console.error("error pack", err);
                const detail = err.error?.message || err.message || 'Erreur inconnue';
                this.errorMessage = `Failed to create pack: ${detail}`;
                this.loading = false;
            }
        });
    }

    goBack(): void {
        if (this.router.url.includes('/admin')) Object.assign(this.router.navigate(['/admin']));
        else this.router.navigate(['/services/packs']);
    }
}
