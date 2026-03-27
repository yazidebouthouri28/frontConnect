import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/api.models';

interface Post {
    id: number;
    userName: string;
    date: string;
    content: string;
    image?: string;
    likes: number;
    userHasLiked: boolean;
    comments: { userName: string; text: string; date: string }[];
}

interface Highlight {
    id: number;
    title: string;
    image: string;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    currentUser: User | null = null;
    viewedUser: User | null = null;
    activeTab: string = 'adventure';
    isOwnProfile: boolean = false;
    isFollowing: boolean = false;
    followingCount: number = 0;
    selectedPostMedia: string | null = null;

    posts: Post[] = [
        {
            id: 1,
            userName: '',
            date: '2 hours ago',
            content: 'Exploring the beauty of the outdoors! ⛰️🌳',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
            likes: 124,
            userHasLiked: false,
            comments: []
        }
    ];

    follows = [
        { name: 'Sarah Johnson', avatar: 'SJ', role: 'Mountain Guide', bio: 'Exploring the peaks since 2015.' }
    ];

    highlights: Highlight[] = [
        { id: 1, title: 'Nature', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' }
    ];

    isEditing: boolean = false;
    editForm: any = { name: '', bio: '', location: '', avatar: '', coverImage: '' };
    newCommentTexts: { [key: number]: string } = {};
    newPostContent: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private location: Location
    ) { }

    ngOnInit() {
        this.currentUser = this.userService.getCurrentUser();

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id && id !== 'me' && id !== this.currentUser?.id) {
                this.userService.getUserById(id).subscribe(user => {
                    this.viewedUser = user;
                    this.isOwnProfile = false;
                    this.loadUserStats();
                });
            } else {
                this.viewedUser = this.currentUser;
                this.isOwnProfile = true;
                if (this.currentUser) {
                    this.editForm = { ...this.currentUser };
                    this.loadUserStats();
                }
            }
        });
    }

    private loadUserStats() {
        if (!this.viewedUser) return;

        this.posts.forEach(post => post.userName = this.viewedUser?.name || 'Explorer');

        this.userService.isFollowing(this.viewedUser.id).subscribe(val => this.isFollowing = val);
        this.userService.getFollowerCount(this.viewedUser.id).subscribe(val => {
            if (this.viewedUser) this.viewedUser.followers = val;
        });
        this.userService.getFollowingCount(this.viewedUser.id).subscribe(val => {
            this.followingCount = val;
            if (this.viewedUser) this.viewedUser.following = val;
        });
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    startEdit() {
        this.isEditing = true;
    }

    cancelEdit() {
        this.isEditing = false;
        if (this.currentUser) this.editForm = { ...this.currentUser };
    }

    saveProfile() {
        if (this.currentUser) {
            this.userService.updateUserProfile(this.currentUser.id, this.editForm).subscribe(updated => {
                this.currentUser = updated;
                this.viewedUser = { ...this.currentUser };
                this.isEditing = false;
            });
        }
    }

    toggleFollow() {
        if (!this.viewedUser) return;

        if (this.isFollowing) {
            this.userService.unfollowUser(this.viewedUser.id).subscribe(() => {
                this.isFollowing = false;
                this.loadUserStats();
            });
        } else {
            this.userService.followUser(this.viewedUser.id).subscribe(() => {
                this.isFollowing = true;
                this.loadUserStats();
            });
        }
    }

    toggleLike(post: Post) {
        post.userHasLiked = !post.userHasLiked;
        post.likes += post.userHasLiked ? 1 : -1;
    }

    addComment(post: Post) {
        const text = this.newCommentTexts[post.id];
        if (!text || !text.trim()) return;
        post.comments.push({
            userName: this.currentUser?.name || 'User',
            text: text,
            date: 'Just now'
        });
        this.newCommentTexts[post.id] = '';
    }

    onPostMediaSelected(event: any) {
        const file = event.target.files[0];
        if (file) this.selectedPostMedia = URL.createObjectURL(file);
    }

    publishPost() {
        if (!this.newPostContent.trim() && !this.selectedPostMedia) return;
        const newPost: Post = {
            id: Date.now(),
            userName: this.currentUser?.name || 'Explorer',
            date: 'Just now',
            content: this.newPostContent,
            image: this.selectedPostMedia || undefined,
            likes: 0,
            userHasLiked: false,
            comments: []
        };
        this.posts.unshift(newPost);
        this.newPostContent = '';
        this.selectedPostMedia = null;
    }

    openMessageWithUser() {
        if (!this.viewedUser) return;
        this.router.navigate(['/community'], { queryParams: { chatWith: this.viewedUser.id } });
    }

    goBack() {
        this.location.back();
    }

    onAddHighlight() {
        console.log('Add highlight clicked');
    }
    addHighlight() { this.onAddHighlight(); }

    onAddStory() {
        console.log('Add story clicked');
    }
    addStory() { this.onAddStory(); }
}
