import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlertService, AlertStatus } from './backend-alert.service';
import { environment } from '../../environments/environment';

describe('AlertService', () => {
    let service: AlertService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/alerts`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AlertService]
        });
        service = TestBed.inject(AlertService);
        httpMock = TestBed.inject(HttpTestingController);

        // Mock local storage to prevent token issues
        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ id: 99, name: 'TestUser' }));
    });

    afterEach(() => {
        httpMock.verify(); // Ensure that there are no outstanding requests
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a POST request to create an alert', () => {
        const mockRequest = {
            title: 'Test SOS',
            description: 'Test emergency',
            latitude: 10.0,
            longitude: 20.0
        };

        const mockResponse = {
            id: 1,
            alertCode: 'SOS-001',
            title: 'Test SOS',
            description: 'Test emergency',
            status: AlertStatus.ACTIVE,
            latitude: 10.0,
            longitude: 20.0,
            createdAt: new Date().toISOString()
        };

        service.createAlert(mockRequest).subscribe(response => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${apiUrl}?reportedById=99`);
        expect(req.request.method).toBe('POST');

        req.flush(mockResponse); // Simulate a successful HTTP response
    });
});
