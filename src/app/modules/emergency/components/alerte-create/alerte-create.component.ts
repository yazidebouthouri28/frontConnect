import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlerteService } from '../../services/alerte.service';
import { UserService } from '../../../../services/user.service';
import { HttpClient } from '@angular/common/http';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var L: any;

@Component({
    selector: 'app-alerte-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './alerte-create.component.html',
    styleUrls: ['./alerte-create.component.css']
})
export class AlerteCreateComponent implements OnInit, AfterViewInit {
    alertForm: FormGroup;
    loading = false;
    submitted = false;
    errorMessage = '';
    locationLoading = false;
    map: any;
    marker: any;

    alertTypes = ['FIRE', 'MEDICAL', 'SECURITY', 'WEATHER', 'OTHER'];
    levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    constructor(
        private fb: FormBuilder,
        private alerteService: AlerteService,
        private router: Router,
        private userService: UserService,
        private sanitizer: DomSanitizer,
        private http: HttpClient
    ) {
        const currentUser = this.userService.getLoggedInUser();
        const reporterName = currentUser ? currentUser.name : 'Unknown User';

        this.alertForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            emergencyType: ['', Validators.required],
            severity: ['MEDIUM', Validators.required],
            location: ['', Validators.required],
            latitude: [null],
            longitude: [null]
        });
    }

    ngOnInit(): void {
        this.captureLocation();
    }

    ngAfterViewInit(): void {
        this.initMap();
    }

    initMap(): void {
        if (typeof L === 'undefined') { console.warn('Leaflet not loaded'); return; }
        // Default center
        this.map = L.map('map').setView([36.0, 10.0], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.map.on('click', (e: any) => {
            this.updateMarker(e.latlng.lat, e.latlng.lng);
        });

        const lat = this.alertForm.get('latitude')?.value;
        const lng = this.alertForm.get('longitude')?.value;
        if (lat && lng) {
            this.updateMarker(lat, lng);
            this.map.setView([lat, lng], 15);
        }
    }

    updateMarker(lat: number, lng: number): void {
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        this.marker = L.marker([lat, lng]).addTo(this.map);
        this.alertForm.patchValue({ latitude: lat, longitude: lng });
        this.reverseGeocode(lat, lng);
    }

    reverseGeocode(lat: number, lng: number): void {
        this.alertForm.patchValue({ location: 'Analyzing coordinates...' });
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

        this.http.get<any>(url).subscribe({
            next: (data) => {
                if (data && data.display_name) {
                    const addr = data.address;
                    let locationName = data.display_name; // Fallback

                    if (addr) {
                        const spot = addr.amenity || addr.leisure || addr.building || addr.tourism || addr.shop;
                        const street = addr.road || addr.pedestrian || addr.footway || addr.path;
                        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality;

                        if (spot && street && city) locationName = `${spot}, ${street}, ${city}`;
                        else if (spot && city) locationName = `${spot}, ${city}`;
                        else if (street && city) locationName = `${street}, ${city}`;
                        else if (city) locationName = city;
                    }
                    this.alertForm.patchValue({ location: locationName });
                } else {
                    this.alertForm.patchValue({ location: 'Unknown Map Location' });
                }
            },
            error: (err) => {
                console.error('Reverse geocoding error', err);
                this.alertForm.patchValue({ location: 'Coordinates Secured' });
            }
        });
    }

    captureLocation(): void {
        if (navigator.geolocation) {
            this.locationLoading = true;
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.alertForm.patchValue({
                        latitude: lat,
                        longitude: lng
                    });
                    if (this.map) {
                        this.updateMarker(lat, lng);
                        this.map.setView([lat, lng], 15);
                    }
                    this.locationLoading = false;
                    console.log('Location captured:', position.coords);
                },
                (error) => {
                    console.error('Error capturing location', error);
                    this.locationLoading = false;
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.alertForm.invalid) return;

        this.loading = true;
        this.alerteService.create(this.alertForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/emergency/list']);
            },
            error: (err) => {
                console.error('Error reporting alert', err);
                this.errorMessage = 'Critical: Failed to send alert. Contact staff directly.';
                this.loading = false;
            }
        });
    }
}
