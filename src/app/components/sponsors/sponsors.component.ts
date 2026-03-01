import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


interface SponsorTier {
    name: string;
    icon: string;
    price: string;
    description: string;
    perks: string[];
}

@Component({
    selector: 'app-sponsors',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sponsors.component.html',
    styleUrls: ['./sponsors.component.css'],
})
export class SponsorsComponent implements OnInit {

    goldSponsors: any[] = [];
    silverSponsors: any[] = [];
    bronzeSponsors: any[] = [];
    communityPartners: any[] = [];

    isLoading = true;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.http.get<any>('/api/sponsors').subscribe({
            next: (res) => {
                const allSponsors: any[] = res.data || [];
                this.categorizeSponsors(allSponsors);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load sponsors:', err);
                this.isLoading = false;
            }
        });
    }

    private categorizeSponsors(sponsors: any[]) {
        sponsors.forEach(sponsor => {
            const level = this.getSponsorLevel(sponsor);
            switch (level) {
                case 'GOLD':
                    this.goldSponsors.push(sponsor);
                    break;
                case 'SILVER':
                    this.silverSponsors.push(sponsor);
                    break;
                case 'BRONZE':
                    this.bronzeSponsors.push(sponsor);
                    break;
                default:
                    this.communityPartners.push({ name: sponsor.name, icon: '🤝' });
            }
        });
    }

 private getSponsorLevel(sponsor: any): string {
    if (sponsor.tier) {
        return sponsor.tier.toUpperCase();
    }
    return 'COMMUNITY';
}

    getFallbackLogo(sponsor: any): string {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(sponsor.name)}&background=random&size=200`;
    }

    sponsorTiers: SponsorTier[] = [
        {
            name: 'Gold', icon: '🥇', price: '5 000 DT',
            description: 'Premium visibility and maximum impact',
            perks: ['Oversized logo on all event materials', 'Dedicated booth at all ConnectCamp events', 'Featured in homepage hero banner', 'Social media spotlight (10 posts)', 'Exclusive speaking slot at events'],
        },
        {
            name: 'Silver', icon: '🥈', price: '2 500 DT',
            description: 'Strong presence across the platform',
            perks: ['Large logo on event materials', 'Shared booth space at events', 'Featured on sponsors page', 'Social media mentions (5 posts)', 'Logo on event merchandise'],
        },
        {
            name: 'Bronze', icon: '🥉', price: '1 000 DT',
            description: 'Great entry-level sponsorship',
            perks: ['Logo on sponsors page', 'Mention in event newsletters', 'Social media mention (2 posts)', 'Name on event program'],
        },
    ];
}