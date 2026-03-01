import { Injectable } from '@angular/core';

export interface User {
    id: string;
    name: string;
    avatar: string;
    role: string;
    email?: string;
    status?: 'online' | 'offline' | 'typing';
    lastSeen?: string;
    bio?: string;
    coverImage?: string;
    location?: string;
    hashtags?: string[];
    followers?: string;
    gallery?: string[];
    achievements?: { title: string; icon: string; description?: string; date?: string }[];
}

export interface UserAccount {
    email: string;
    password: string;
    role: 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT' | 'USER';
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private accounts: UserAccount[] = [];

    constructor() {
        this.loadAccounts();
    }

    private loadAccounts(): void {
        const stored = localStorage.getItem('campconnect_accounts');
        if (stored) {
            this.accounts = JSON.parse(stored);
        } else {
            // Initial default accounts
            this.accounts = [
                { email: 'admin@campconnect.com', password: 'admin123', role: 'ADMIN', name: 'Admin Manager' },
                { email: 'organizer@campconnect.com', password: 'org123', role: 'ORGANIZER', name: 'Event Organizer' },
                { email: 'participant@campconnect.com', password: 'part123', role: 'PARTICIPANT', name: 'Service Participant' },
                { email: 'user@campconnect.com', password: 'user123', role: 'USER', name: 'Standard Camper' },
            ];
            this.saveAccounts();
        }
    }

    private saveAccounts(): void {
        localStorage.setItem('campconnect_accounts', JSON.stringify(this.accounts));
    }

    private currentUser: User = {
        id: 'me',
        name: 'Ahmed Ben Salem',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
        role: 'Adventure Guide',
        email: 'ahmed@connectcamp.tn',
        bio: 'Professional guide with 10 years of experience in the Tunisian mountains.',
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
        location: 'Hammamet, Tunisia',
        hashtags: ['#Hiking', '#Guide'],
        followers: '1.2K',
        gallery: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400',
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=400',
            'https://images.unsplash.com/photo-1496062031456-07b8f162a322?q=80&w=400',
            'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=400'
        ],
        achievements: [
            { title: 'Peak Conqueror', icon: '🏔️', description: 'Reached the summit of 5 different Tunisian peaks.', date: 'Oct 2025' },
            { title: 'Night Owl', icon: '🦉', description: 'Completed 10 solo night camping trips in the Tunisian desert.', date: 'Dec 2025' }
        ]
    };

    private mockUsers: User[] = [
        {
            id: '1',
            name: 'Yassine Trabelsi',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
            role: 'Gear Expert',
            bio: 'Gear specialist and outdoor enthusiast. If you need equipment advice for the Sahara, I am your guy!',
            coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
            location: 'Tunis, Tunisia',
            hashtags: ['#Gear', '#Camping'],
            followers: '5k+',
            gallery: [
                'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400',
                'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=400'
            ],
            achievements: [{ title: 'Peak Conqueror', icon: '🏔️' }, { title: 'First Aid', icon: '🩹' }]
        },
        {
            id: '2',
            name: 'Mariem Guezguez',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
            role: 'Survivalist',
            bio: 'Exploring the wild side of Tunisia.',
            coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200',
            location: 'Sousse, Tunisia',
            hashtags: ['#Survival', '#Wild'],
            followers: '2.5k'
        },
        {
            id: '3',
            name: 'Selim Riahi',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
            role: 'Trail Photographer',
            bio: 'Capturing the beauty of Tunisian landscapes.',
            coverImage: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?q=80&w=1200',
            location: 'Bizerte, Tunisia',
            hashtags: ['#Photography', '#Nature'],
            followers: '10k'
        }
    ];


    getCurrentUser(): User {
        return this.currentUser;
    }

    getUserById(id: string): User | undefined {
        if (id === 'me') return this.currentUser;
        return this.mockUsers.find(u => u.id === id);
    }

    login(email: string, password: string): UserAccount | null {
        const account = this.accounts.find(a => a.email === email && a.password === password) || null;
        if (account) {
            localStorage.setItem('currentUser', JSON.stringify(account));
        }
        return account;
    }

    getLoggedInUser(): UserAccount | null {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    isAdmin(): boolean {
        return this.getLoggedInUser()?.role === 'ADMIN';
    }

    isOrganizer(): boolean {
        return this.getLoggedInUser()?.role === 'ORGANIZER';
    }

    isParticipant(): boolean {
        return this.getLoggedInUser()?.role === 'PARTICIPANT';
    }

    isUser(): boolean {
        return this.getLoggedInUser()?.role === 'USER';
    }

    logout(): void {
        localStorage.removeItem('currentUser');
    }

    signup(account: UserAccount): UserAccount {
        this.accounts.push(account);
        this.saveAccounts();
        return account;
    }
}
