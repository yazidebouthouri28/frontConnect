import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat-rooms`;
  private messageUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) { }

  getMyRooms(userId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`).pipe(map(r => r.data?.content || r.data || []));
  }

  getPublicRooms(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/public`).pipe(map(r => r.data?.content || r.data || []));
  }

  getRoom(roomId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roomId}`).pipe(map(r => r.data));
  }

  createRoom(creatorId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?creatorId=${creatorId}`, data).pipe(map(r => r.data));
  }

  updateRoom(roomId: number, userId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${roomId}?userId=${userId}`, data).pipe(map(r => r.data));
  }

  deleteRoom(roomId: number, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${roomId}?userId=${userId}`);
  }

  getMessages(roomId: number): Observable<any[]> {
    return this.http.get<any>(`${this.messageUrl}/room/${roomId}/history`).pipe(map(r => r.data || []));
  }

  sendMessage(roomId: number, senderId: number, content: string, mediaUrl?: string, fileName?: string): Observable<any> {
    const payload = {
      chatRoomId: roomId,
      senderId: senderId,
      content: content || (mediaUrl ? 'Photo' : ''),
      mediaUrl: mediaUrl,
      fileName: fileName,
      messageType: mediaUrl ? 'IMAGE' : (fileName ? 'FILE' : 'TEXT')
    };
    return this.http.post<any>(this.messageUrl, payload).pipe(map(r => r.data || r));
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete<any>(`${this.messageUrl}/${messageId}`);
  }
}