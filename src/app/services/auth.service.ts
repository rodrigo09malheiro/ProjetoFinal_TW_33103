import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  username: string;
}

interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';
  private baseUrl = 'http://localhost:3000';

  private usernameSubject = new BehaviorSubject<string | null>(this.getUsername());
  username$ = this.usernameSubject.asObservable();

  private avatarSubject = new BehaviorSubject<string | null>(this.getAvatar());
  avatar$ = this.avatarSubject.asObservable();

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        this.usernameSubject.next(res.username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    this.usernameSubject.next(null);
    this.avatarSubject.next(null);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(data: { username?: string; email?: string; password?: string }): Observable<{ message: string; username: string }> {
    return this.http.put<{ message: string; username: string }>(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() }).pipe(
      tap((res) => {
        localStorage.setItem('username', res.username);
        this.usernameSubject.next(res.username);
      })
    );
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/profile/avatar`, formData, { headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }) }).pipe(
      tap((res) => {
        const fullUrl = this.baseUrl + res.avatarUrl;
        localStorage.setItem('avatar', fullUrl);
        this.avatarSubject.next(fullUrl);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getAvatar(): string | null {
    return localStorage.getItem('avatar');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}