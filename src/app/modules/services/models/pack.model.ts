export interface Pack {
    id?: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    serviceIds: number[];
    discount: number;
    available: boolean;
    image?: string;
    imageUrl?: string;
    images?: string[];
    promotion?: string;
    season?: string;
    /** Valid values: ADVENTURE, CUSTOM, FAMILY, RELAXATION, PREMIUM, VIP, BASIC, GROUP, STANDARD */
    category?: string;
    score?: number;
    isActive?: boolean;
    serviceNames?: string[];
    serviceCount?: number;
    discountPercentage?: number;
    durationDays?: number;
    maxPersons?: number;
}
