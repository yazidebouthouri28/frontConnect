import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ProductDetailComponent } from './product-detail/product-detail.component';

interface Review {
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  rentalPrice?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  loyaltyPoints: number;
  featured: boolean;
  discount?: string;
  rentalAvailable?: boolean;
  features?: string[];
  specs?: { [key: string]: string };
  options?: {
    name: string;
    values: string[];
  }[];
  reviewsList?: Review[];
  images?: string[];
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, NgClass, ProductDetailComponent],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css'],
})
export class MarketplaceComponent {
  viewMode: 'buy' | 'rent' = 'buy';
  selectedProduct: Product | null = null;

  categories = [
    { id: 'all', name: 'All Products', count: 24, icon: '🏷️' },
    { id: 'tents', name: 'Tents', count: 8, icon: '⛺' },
    { id: 'sleeping', name: 'Sleeping Gear', count: 6, icon: '💤' },
    { id: 'cooking', name: 'Cooking', count: 5, icon: '🔥' },
    { id: 'backpacks', name: 'Backpacks', count: 3, icon: '🎒' },
    { id: 'accessories', name: 'Accessories', count: 2, icon: '🔨' }
  ];

  priceRanges = [
    { id: '0-50', name: '0-50 DT' },
    { id: '50-75', name: '50-75 DT' },
    { id: '75-150', name: '75-150 DT' },
    { id: '150+', name: 'Over 150 DT' }
  ];

  ratings = [
    { value: 5, label: '5' },
    { value: 4, label: '>4' },
    { value: 3, label: '>3' },
    { value: 2, label: '>2' },
    { value: 1, label: '>1' }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Family Camping Setup',
      category: 'Tents',
      image: 'https://images.unsplash.com/photo-1533873984035-25970ab07451?q=80&w=1080',
      price: 299,
      rentalPrice: 45,
      rating: 4.7,
      reviews: 128,
      inStock: true,
      loyaltyPoints: 299,
      featured: true,
      discount: '-20% OFF',
      rentalAvailable: true,
      features: ['Spacious 6-person capacity', 'Weatherproof rainfly included', 'Easy 10-minute setup', 'Interior storage pockets'],
      specs: { 'Capacity': '6 Person', 'Weight': '18 lbs', 'Season': '3-Season', 'Fabric': 'Polyester' },
      options: [
        { name: 'Color', values: ['Forest Green', 'Sandstone'] }
      ]
    },
    {
      id: 2,
      name: 'Night Forest Tent',
      category: 'Tents',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1080',
      price: 149,
      rentalPrice: 25,
      rating: 4.9,
      reviews: 256,
      inStock: true,
      loyaltyPoints: 149,
      featured: true,
      discount: '-15% OFF',
      rentalAvailable: true,
      features: ['Ultralight design', 'Compact carry bag', 'High-ventilation mesh'],
      specs: { 'Capacity': '2 Person', 'Weight': '4.5 lbs', 'Season': '3-Season' }
    },
    {
      id: 3,
      name: 'Mountain View Tent',
      category: 'Tents',
      image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1080',
      price: 189,
      rentalPrice: 30,
      rating: 4.6,
      reviews: 94,
      inStock: true,
      loyaltyPoints: 189,
      featured: false,
      rentalAvailable: true,
      specs: { 'Capacity': '4 Person', 'Weight': '9 lbs' }
    },
    {
      id: 4,
      name: 'Sunset Ridge Tent',
      category: 'Tents',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1080',
      price: 219,
      rentalPrice: 35,
      rating: 4.8,
      reviews: 187,
      inStock: true,
      loyaltyPoints: 219,
      featured: false,
      discount: '-25% OFF',
      rentalAvailable: true,
      specs: { 'Capacity': '3 Person', 'Weight': '7 lbs' }
    },
    {
      id: 5,
      name: 'Glacier Point Sleeping Bag',
      category: 'Sleeping Gear',
      image: 'https://images.unsplash.com/photo-1626252346582-c7721d805e0d?q=80&w=1080',
      price: 89,
      rentalPrice: 15,
      rating: 4.8,
      reviews: 342,
      inStock: true,
      loyaltyPoints: 89,
      featured: true,
      rentalAvailable: true,
      features: ['Rated for -10°C / 15°F', 'Water-resistant downthek', 'Anti-snag zipper guard'],
      specs: { 'Temp Rating': '15°F / -10°C', 'Fill Type': 'Synthetic', 'Weight': '3.2 lbs' },
      options: [
        { name: 'Size', values: ['Regular', 'Long'] },
        { name: 'Zipper', values: ['Left Zip', 'Right Zip'] }
      ],
      reviewsList: [
        { author: 'Slim H.', avatar: 'https://i.pravatar.cc/150?u=15', rating: 5, date: 'Last week', comment: 'Kept me warm at -5C in the Atlas mountains no problem. Compressibility is excellent.' }
      ]
    },
    {
      id: 6,
      name: 'Trailblazer 65L Backpack',
      category: 'Backpacks',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1080',
      price: 159,
      rentalPrice: 20,
      rating: 4.7,
      reviews: 156,
      inStock: true,
      loyaltyPoints: 159,
      featured: false,
      rentalAvailable: true,
      features: ['Adjustable suspension system', 'Rain cover included', 'Hydration bladder compatible'],
      specs: { 'Capacity': '65 Liters', 'Weight': '4.1 lbs', 'Material': 'Ripstop Nylon' },
      options: [
        { name: 'Color', values: ['Red', 'Blue', 'Black'] },
        { name: 'Torso Size', values: ['Small', 'Medium', 'Large'] }
      ],
      reviewsList: [
        { author: 'Olfa W.', avatar: 'https://i.pravatar.cc/150?u=16', rating: 4, date: '2 months ago', comment: 'Very comfortable suspension for long Tunisia treks. Wish the hip belt pockets were slightly larger.' }
      ]
    },
    {
      id: 7,
      name: 'Portable Camp Stove',
      category: 'Cooking',
      image: 'https://images.unsplash.com/photo-1595166687029-797d10078049?q=80&w=1080',
      price: 45,
      rentalPrice: 8,
      rating: 4.5,
      reviews: 89,
      inStock: true,
      loyaltyPoints: 45,
      featured: false,
      rentalAvailable: true,
      features: ['Double burner system', 'Wind blocking shields', 'Easy ignition'],
      specs: { 'Fuel Type': 'Propane', 'BTU': '20,000', 'Weight': '10 lbs' },
      reviewsList: [
        { author: 'Chef Dan', avatar: 'https://i.pravatar.cc/150?u=17', rating: 5, date: 'Yesterday', comment: 'Cooks evenly and the wind guards actually work.' }
      ]
    },
    {
      id: 8,
      name: 'LED Camping Lantern',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1536402432857-b08846c48398?q=80&w=1080',
      price: 25,
      rentalPrice: 5,
      rating: 4.6,
      reviews: 210,
      inStock: true,
      loyaltyPoints: 25,
      featured: false,
      rentalAvailable: true,
      features: ['1000 Lumens', 'Rechargeable battery', 'Waterproof IPX4'],
      specs: { 'Brightness': '1000 Lumens', 'Battery Life': '12 Hours', 'Weight': '1.5 lbs' },
      reviewsList: [
        { author: 'NightOwl', avatar: 'https://i.pravatar.cc/150?u=18', rating: 5, date: '3 weeks ago', comment: 'Bright enough to light up the whole campsite.' }
      ]
    },
    {
      id: 9,
      name: 'Alpine Zero Sleeping Bag',
      category: 'Sleeping Gear',
      image: 'https://images.unsplash.com/photo-1517175780336-9a2ad9eec48f?q=80&w=1080',
      price: 129,
      rentalPrice: 20,
      rating: 4.9,
      reviews: 87,
      inStock: true,
      loyaltyPoints: 129,
      featured: true,
      rentalAvailable: true,
      features: ['Rated for 0°F / -18°C', 'Mummy shape', 'Draft collar'],
      specs: { 'Temp Rating': '0°F / -18°C', 'Fill Type': '800-fill Down', 'Weight': '2.8 lbs' },
      reviewsList: [
        { author: 'SummitSeeker', avatar: 'https://i.pravatar.cc/150?u=19', rating: 5, date: '1 month ago', comment: 'Saved me during a snowstorm. Warmest bag I own.' }
      ]
    },
    {
      id: 10,
      name: 'Ultralight Sleeping Pad',
      category: 'Sleeping Gear',
      image: 'https://images.unsplash.com/photo-1623912648366-0772714a601c?q=80&w=1080',
      price: 75,
      rentalPrice: 10,
      rating: 4.5,
      reviews: 112,
      inStock: true,
      loyaltyPoints: 75,
      featured: false,
      rentalAvailable: true,
      specs: { 'R-Value': '4.2', 'Thicknes': '3 inches', 'Weight': '14 oz' },
      reviewsList: [
        { author: 'HikerJoe', avatar: 'https://i.pravatar.cc/150?u=20', rating: 4, date: '2 weeks ago', comment: 'Comfortable but takes a while to inflate.' }
      ]
    },
    {
      id: 11,
      name: 'Titanium Cookset',
      category: 'Cooking',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1080',
      price: 65,
      rentalPrice: 10,
      rating: 4.7,
      reviews: 56,
      inStock: true,
      loyaltyPoints: 65,
      featured: false,
      rentalAvailable: true,
      features: ['Nesting design', 'Includes pot, pan, and lid', 'Ultralight titanium'],
      specs: { 'Material': 'Titanium', 'Pieces': '3', 'Weight': '6 oz' },
      reviewsList: [
        { author: 'GramCounter', avatar: 'https://i.pravatar.cc/150?u=21', rating: 5, date: '3 days ago', comment: 'Incredibly light. Perfect for through-hiking.' }
      ]
    },
    {
      id: 12,
      name: 'Rugged 30L Cooler',
      category: 'Cooking',
      image: 'https://images.unsplash.com/photo-1622289419572-c0e66b449830?q=80&w=1080',
      price: 199,
      rentalPrice: 25,
      rating: 4.8,
      reviews: 230,
      inStock: true,
      loyaltyPoints: 199,
      featured: true,
      rentalAvailable: true,
      features: ['Keeps ice for 5 days', 'Bear-resistant', 'Rotomolded construction'],
      specs: { 'Capacity': '30 Liters', 'Weight': '15 lbs', 'Material': 'Polyethylene' },
      options: [
        { name: 'Color', values: ['Tan', 'White', 'Charcoal'] }
      ],
      reviewsList: [
        { author: 'Amine B.', avatar: 'https://i.pravatar.cc/150?u=22', rating: 5, date: 'Last weekend', comment: 'Ice was still there after 4 days in the 40 degree Douz heat.' }
      ]
    },
    {
      id: 13,
      name: 'Dayhiker 25L Pack',
      category: 'Backpacks',
      image: 'https://images.unsplash.com/photo-1547849629-4d642bde7d46?q=80&w=1080',
      price: 85,
      rentalPrice: 12,
      rating: 4.6,
      reviews: 145,
      inStock: true,
      loyaltyPoints: 85,
      featured: false,
      rentalAvailable: true,
      specs: { 'Capacity': '25 Liters', 'Weight': '2 lbs', 'Material': 'Nylon' },
      options: [{ name: 'Color', values: ['Orange', 'Green', 'Black'] }],
      reviewsList: [
        { author: 'CityWalker', avatar: 'https://i.pravatar.cc/150?u=23', rating: 4, date: '1 month ago', comment: 'Great for day trips, but the shoulder straps could be more padded.' }
      ]
    },
    {
      id: 14,
      name: 'Expedition 85L Pack',
      category: 'Backpacks',
      image: 'https://images.unsplash.com/photo-1627854683050-ecba372d8ce3?q=80&w=1080',
      price: 249,
      rentalPrice: 35,
      rating: 4.9,
      reviews: 67,
      inStock: true,
      loyaltyPoints: 249,
      featured: true,
      rentalAvailable: true,
      features: ['Custom fit suspension', 'Removable daypack', 'Waterproof zippers'],
      specs: { 'Capacity': '85 Liters', 'Weight': '5.2 lbs', 'Load Rating': '60 lbs' },
      reviewsList: [
        { author: 'TrekkerGlobal', avatar: 'https://i.pravatar.cc/150?u=24', rating: 5, date: '2 weeks ago', comment: 'Carried 50lbs comfortably for 7 days. Beast of a pack.' }
      ]
    },
    {
      id: 15,
      name: 'Pro Headlamp 500',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1623912648366-0772714a601c?q=80&w=1080',
      price: 35,
      rentalPrice: 5,
      rating: 4.7,
      reviews: 312,
      inStock: true,
      loyaltyPoints: 35,
      featured: false,
      rentalAvailable: true,
      specs: { 'Lumens': '500', 'Beam Distance': '100m', 'Waterproof': 'IP67' },
      reviewsList: [
        { author: 'Spelunker', avatar: 'https://i.pravatar.cc/150?u=25', rating: 5, date: 'Yesterday', comment: 'Super bright and the battery lasts forever.' }
      ]
    },
    {
      id: 16,
      name: 'Camping Multi-Tool',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1582239401768-3c4ba7c31e67?q=80&w=1080',
      price: 55,
      rentalPrice: 0,
      rating: 4.8,
      reviews: 189,
      inStock: true,
      loyaltyPoints: 55,
      featured: false,
      rentalAvailable: false,
      specs: { 'Tools': '14', 'Material': 'Stainless Steel', 'Weight': '8 oz' },
      reviewsList: [
        { author: 'Handyman', avatar: 'https://i.pravatar.cc/150?u=26', rating: 5, date: '1 week ago', comment: 'Has everything I need. The knife is sharp.' }
      ]
    },
    {
      id: 17,
      name: 'Compact First Aid Kit',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1603561919864-1ae287265a0c?q=80&w=1080',
      price: 29,
      rentalPrice: 0,
      rating: 4.9,
      reviews: 450,
      inStock: true,
      loyaltyPoints: 29,
      featured: false,
      rentalAvailable: false,
      specs: { 'Pieces': '100', 'Case': 'Waterproof', 'Weight': '1 lb' },
      reviewsList: [
        { author: 'SafetyFirst', avatar: 'https://i.pravatar.cc/150?u=27', rating: 5, date: '1 month ago', comment: 'Comprehensive kit in a small package. Hope I never have to use it!' }
      ]
    },
    {
      id: 18,
      name: 'Portable Camping Chair',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1595166687029-797d10078049?q=80&w=1080',
      price: 49,
      rentalPrice: 8,
      rating: 4.5,
      reviews: 220,
      inStock: true,
      loyaltyPoints: 49,
      featured: false,
      rentalAvailable: true,
      features: ['Collapsible design', 'Cup holder', 'Carry bag included'],
      specs: { 'Weight Capacity': '300 lbs', 'Product Weight': '2 lbs', 'Material': 'Aluminum' },
      reviewsList: [
        { author: 'Relaxer', avatar: 'https://i.pravatar.cc/150?u=28', rating: 4, date: '3 days ago', comment: 'Good chair for the price. A bit low to the ground.' }
      ]
    }
  ];

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSelection() {
    this.selectedProduct = null;
  }
}
