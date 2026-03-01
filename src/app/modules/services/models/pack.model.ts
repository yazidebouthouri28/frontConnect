export interface Pack {
    id: number;
    name: string;
    description: string;
    price: number;
    serviceIds: number[];
    discount: number;
    available: boolean;
    image?: string;
    images?: string[];
    promotion?: string;
    season?: string;
    category?: string;
    score?: number;
    isActive?: boolean;
    serviceNames?: string[];
}
