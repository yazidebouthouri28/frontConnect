import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PointsService {

  private apiUrl = 'http://localhost:8089/api/points';

  constructor(private http: HttpClient) {}

  getPoints(userId: number) {
    return this.http.get<number>(`${this.apiUrl}/${userId}/balance`);
  }
}
