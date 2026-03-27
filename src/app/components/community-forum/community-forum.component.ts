import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/api.models';
import { ChatService } from '../../services/chat.service';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-community-forum',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './community-forum.component.html',
    styleUrls: ['./community-forum.component.css']
})
export class CommunityForumComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    currentUser: User | null = null;
    onlineUsers: any[] = [];
    rooms: any[] = [];
    activeRoom: any = null;
    messages: any[] = [];
    newMessage: string = '';
    isLoadingRooms = true;
    isLoadingMessages = false;
    selectedFile: File | null = null;
    targetUserId: number | null = null;

    // Voice & Media state
    isRecording = false;
    recordingDuration = 0;
    private mediaRecorder: any;
    private audioChunks: any[] = [];
    private recordingTimer: any;

    // Interactive state
    showGroupModal = false;
    newGroupName = '';
    newGroupDesc = '';
    allUsers: any[] = [];
    selectedMemberIds: number[] = [];
    showReactionPickerFor: number | null = null;
    reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

    private shouldScroll = false;
    private pollSubscription?: Subscription;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.currentUser = this.userService.getCurrentUser();

        this.route.queryParams.subscribe(params => {
            const chatWithId = params['chatWith'];
            if (chatWithId) {
                this.targetUserId = Number(chatWithId);
                this.handleDirectChat(chatWithId);
            } else {
                this.loadRooms();
            }
        });

        this.loadOnlineUsers();
        this.loadAllUsers();
        // Refresh online list every 10 seconds
        interval(10000).subscribe(() => this.loadOnlineUsers());
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        if (this.shouldScroll && this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            this.shouldScroll = false;
        }
    }

    // ── Real-time Polling ─────────────────────────────────────────────────────

    private startPolling(roomId: number) {
        this.stopPolling();
        this.pollSubscription = interval(3000).pipe(
            startWith(0),
            switchMap(() => this.chatService.getMessages(roomId))
        ).subscribe(msgs => {
            if (msgs.length > this.messages.length) {
                this.messages = msgs;
                this.shouldScroll = true;
            }
        });
    }

    private stopPolling() {
        if (this.pollSubscription) this.pollSubscription.unsubscribe();
    }

    // ── Interactive Features ──────────────────────────────────────────────────

    reactToMessage(msgId: number, reaction: string) {
        const msg = this.messages.find(m => m.id === msgId);
        if (msg) {
            if (!msg.reactions) msg.reactions = {};
            msg.reactions[reaction] = (msg.reactions[reaction] || 0) + 1;
            this.showReactionPickerFor = null;
            // In a real app, call this.chatService.addReaction(msgId, reaction)
        }
    }

    deleteMessage(msgId: number) {
        if (confirm('Delete this message?')) {
            const tempMsgs = [...this.messages];
            this.messages = this.messages.filter(m => m.id !== msgId);

            this.chatService.deleteMessage(msgId).subscribe({
                error: () => {
                    this.messages = tempMsgs;
                    alert('Could not delete message from server.');
                }
            });
        }
    }

    simulateBotResponse() {
        const responses = [
            "That sounds like an amazing adventure!",
            "I've been there too, the view is breathtaking.",
            "Make sure to bring extra supplies for that trek.",
            "Can you share more photos of the landscape?",
            "I'm planning a similar trip next month!",
            "Did you see the hidden waterfall near the camp?"
        ];

        setTimeout(() => {
            const botMsg = {
                id: Date.now(),
                content: responses[Math.floor(Math.random() * responses.length)],
                senderName: 'Adventurer Bot',
                senderId: 999, // Bot ID
                sentAt: new Date(),
                messageType: 'TEXT'
            };
            this.messages.push(botMsg);
            this.shouldScroll = true;
        }, 2000);
    }

    getSharedMedia() {
        return this.messages
            .filter(m => m.mediaUrl)
            .map(m => ({
                url: m.mediaUrl,
                type: m.messageType,
                name: m.fileName || 'Shared Media',
                sentAt: m.sentAt
            }))
            .slice(-6); // Only show last 6 items for clean sidebar
    }

    // ── Voice Recording ───────────────────────────────────────────────────────

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (event: any) => this.audioChunks.push(event.data);
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.sendVoiceMessage(audioBlob);
            };
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingDuration = 0;
            this.recordingTimer = setInterval(() => this.recordingDuration++, 1000);
        } catch (err) {
            alert('Could not access microphone: ' + err);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            clearInterval(this.recordingTimer);
            this.mediaRecorder.stream.getTracks().forEach((t: any) => t.stop());
        }
    }

    sendVoiceMessage(blob: Blob) {
        const mockVoiceUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        this.proceedWithSendMessage(false, mockVoiceUrl, 'voice-message.wav', 'AUDIO');
    }

    // ── Data Loading & Logic ──────────────────────────────────────────────────

    loadRooms() {
        this.isLoadingRooms = true;
        const userId = this.getNumericUserId();
        this.chatService.getMyRooms(userId).subscribe({
            next: (rooms) => {
                this.rooms = rooms;
                if (rooms.length > 0) this.selectRoom(rooms[0]);
                else this.loadPublicRooms();
                this.isLoadingRooms = false;
            },
            error: () => this.loadPublicRooms()
        });
    }

    loadPublicRooms() {
        this.chatService.getPublicRooms().subscribe({
            next: (rooms) => {
                this.rooms = rooms;
                if (this.rooms.length === 0) this.rooms = [{ id: 0, name: 'Adventure Hub', description: 'Global community chat.' }];
                this.isLoadingRooms = false;
                if (!this.activeRoom && this.rooms.length > 0) this.selectRoom(this.rooms[0]);
            },
            error: () => {
                this.isLoadingRooms = false;
                this.rooms = [{ id: 0, name: 'Local Chat', description: 'Self-repairing link.' }];
                if (!this.activeRoom) this.selectRoom(this.rooms[0]);
            }
        });
    }

    loadOnlineUsers() {
        this.userService.getActiveUsers().subscribe({
            next: (res) => {
                const users = res.data?.content || res.data || [];
                // Filter out current user and map to match UI if needed
                this.onlineUsers = users.filter((u: any) => u.id !== this.currentUser?.id);
            }
        });
    }

    loadAllUsers() {
        this.userService.getAllUsers().subscribe({
            next: (res) => {
                this.allUsers = res.data?.content || res.data || [];
            }
        });
    }

    toggleMemberSelection(userId: any) {
        const id = Number(userId);
        if (this.selectedMemberIds.includes(id)) {
            this.selectedMemberIds = this.selectedMemberIds.filter(mid => mid !== id);
        } else {
            this.selectedMemberIds.push(id);
        }
    }

    handleDirectChat(targetId: string) {
        this.isLoadingRooms = true;
        const userId = this.getNumericUserId();

        this.userService.getUserById(targetId).subscribe({
            next: (targetUser) => {
                if (!targetUser) { this.loadRooms(); return; }

                // Try to find existing private chat in current rooms first
                this.chatService.getMyRooms(userId).subscribe(rooms => {
                    const existing = rooms.find(r =>
                        (r.type === 'PRIVATE' || r.name.toLowerCase().includes(targetUser.name.toLowerCase())) &&
                        !r.isPublic
                    );

                    if (existing) {
                        this.rooms = rooms;
                        this.selectRoom(existing);
                        this.isLoadingRooms = false;
                    } else {
                        // If not found in my rooms, check public (unlikely for private) or create temp
                        this.chatService.getPublicRooms().subscribe(publicRooms => {
                            const room = publicRooms.find(r => r.name.toLowerCase().includes(targetUser.name.toLowerCase()));
                            if (room) {
                                this.rooms = publicRooms;
                                this.selectRoom(room);
                            } else {
                                const newRoom: any = {
                                    id: 0,
                                    name: targetUser.name,
                                    description: 'Private Chat',
                                    isPrivate: true,
                                    type: 'PRIVATE',
                                    members: [targetUser],
                                    targetUserId: Number(targetId)
                                };
                                this.rooms = [newRoom, ...publicRooms];
                                this.selectRoom(newRoom);
                            }
                            this.isLoadingRooms = false;
                        });
                    }
                });
            },
            error: () => {
                this.loadRooms();
                this.isLoadingRooms = false;
            }
        });
    }

    selectRoom(room: any) {
        this.activeRoom = room;
        this.messages = [];
        this.stopPolling();

        if (room.id === 0) {
            this.messages = [{ id: -1, content: 'Say something to start the adventure!', senderName: 'System', sentAt: new Date(), messageType: 'TEXT' }];
            return;
        }

        this.isLoadingMessages = true;
        this.chatService.getMessages(room.id).subscribe({
            next: (msgs) => {
                this.messages = msgs;
                this.isLoadingMessages = false;
                this.shouldScroll = true;
                this.startPolling(room.id);
            },
            error: () => {
                this.isLoadingMessages = false;
                this.messages = [{ id: -1, content: 'Conversation started!', senderName: 'System', sentAt: new Date(), messageType: 'TEXT' }];
                this.startPolling(room.id);
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const isImage = file.type.startsWith('image/');
            const mockUrl = isImage ? 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=500' : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            this.proceedWithSendMessage(isImage, mockUrl, file.name, isImage ? 'IMAGE' : 'FILE');
        }
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.activeRoom || !this.currentUser) return;
        if (this.activeRoom.id === 0) {
            this.ensureRoomExistsAndSend();
            return;
        }
        this.proceedWithSendMessage();
    }

    private ensureRoomExistsAndSend() {
        const creatorId = this.getNumericUserId();

        const memberIds = [creatorId];
        if (this.activeRoom.targetUserId) {
            memberIds.push(this.activeRoom.targetUserId);
        } else if (this.activeRoom.members) {
            this.activeRoom.members.forEach((m: any) => {
                const mid = Number(String(m.id).match(/\d+/)?.[0] || m.id);
                if (mid && mid !== creatorId) memberIds.push(mid);
            });
        }

        const data = {
            name: this.activeRoom.name,
            description: this.activeRoom.description,
            type: this.activeRoom.type || (this.activeRoom.isPrivate ? 'PRIVATE' : 'PUBLIC'),
            isPublic: !this.activeRoom.isPrivate,
            memberIds: [...new Set(memberIds)]
        };

        this.chatService.createRoom(creatorId, data).subscribe({
            next: (room) => {
                this.activeRoom.id = room.id;
                this.proceedWithSendMessage();
                this.startPolling(room.id);
            },
            error: (err) => alert('Sync Error: ' + (err.message || 'Database mismatch.'))
        });
    }

    private proceedWithSendMessage(isImage: boolean = false, mediaUrl?: string, fileName?: string, msgType: string = 'TEXT') {
        const senderId = this.getNumericUserId();
        const content = this.newMessage || (msgType === 'AUDIO' ? 'Voice Note' : (msgType === 'IMAGE' ? 'Sent photo' : (fileName || 'Sent file')));

        const tempMsg = {
            id: Date.now(),
            content,
            senderName: this.currentUser?.name,
            senderId: this.currentUser?.id,
            sentAt: new Date(),
            mediaUrl,
            fileName,
            messageType: msgType,
            status: 'sending'
        };

        this.messages.push(tempMsg);
        this.shouldScroll = true;
        this.newMessage = '';

        this.chatService.sendMessage(this.activeRoom.id, senderId, content, mediaUrl, fileName).subscribe({
            next: (res) => {
                const idx = this.messages.indexOf(tempMsg);
                if (idx !== -1 && res) this.messages[idx] = { ...res, senderName: this.currentUser?.name };
                if (this.activeRoom.id > 0) this.simulateBotResponse(); // Trigger bot reply
            },
            error: (err) => {
                const idx = this.messages.indexOf(tempMsg);
                if (idx !== -1) { this.messages[idx].status = 'error'; this.messages[idx].content += ' (Failed)'; }
                alert('Messaging Error: ' + (err.message || 'Unauthorized'));
            }
        });
    }

    createGroup() {
        if (!this.newGroupName.trim()) return;
        const userId = this.getNumericUserId();

        // Include self and selected members
        const memberIds = [userId, ...this.selectedMemberIds];

        const data = {
            name: this.newGroupName,
            description: this.newGroupDesc,
            type: 'PUBLIC',
            isPublic: true,
            memberIds: [...new Set(memberIds)]
        };

        this.chatService.createRoom(userId, data).subscribe({
            next: (room) => {
                this.rooms.unshift(room);
                this.selectRoom(room);
                this.showGroupModal = false;
                this.newGroupName = '';
                this.newGroupDesc = '';
                this.selectedMemberIds = [];
            },
            error: (err) => alert('Failed: ' + (err.message || 'Unauthorized'))
        });
    }

    private getNumericUserId(): number {
        const id = String(this.currentUser?.id || '1');
        const match = id.match(/\d+/);
        const num = match ? Number(match[0]) : Number(id);
        return isNaN(num) ? 1 : num;
    }

    isCurrentUser(sid: any): boolean {
        const cid = String(this.currentUser?.id);
        const s = String(sid);
        return s === cid || cid.includes(s) || s.includes(cid);
    }

    getAvatar(n: string): string {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(n || 'U')}&background=random`;
    }

    viewProfile(u: any) { this.router.navigate(['/profile', u.id]); }

    formatDuration(s: number): string {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getObjectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }
}
