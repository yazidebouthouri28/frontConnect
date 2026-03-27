export interface Alerte {
    id: number;
    title: string;
    description: string;
    emergencyType: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'WEATHER' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
    location: string;
    latitude?: number;
    longitude?: number;
    reportedBy: string;
    reportedById?: number;
    reportedByName?: string;
    reportedAt: Date | string;
    siteId?: number;
    siteName?: string;
    // Keeping 'type' for legacy compatibility if needed, but aligning with 'emergencyType'
    type: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'WEATHER' | 'OTHER';
}
