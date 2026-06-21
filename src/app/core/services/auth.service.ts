/**
 * core/services/auth.service.ts
 * --------------------------------------------------------------------------
 * Service responsável por toda a autenticação e gestão de sessão do
 * utilizador: registo, login, logout, leitura/atualização do perfil e
 * upload de avatar. Guarda o token JWT, o username e o avatar em
 * localStorage para persistirem entre recarregamentos da página, e expõe
 * dois Observables (username$ e avatar$) para que outros componentes
 * (ex: app.component.ts) reajam automaticamente a alterações de sessão.
 * --------------------------------------------------------------------------
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  username: string;
}

interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private baseUrl = environment.baseUrl;

  // Estado reativo do username — inicializado com o que já estiver guardado (se houver token)
  private usernameSubject = new BehaviorSubject<string | null>(this.getToken() ? this.getUsername() : null);
  username$ = this.usernameSubject.asObservable();

  // Estado reativo do avatar — qualquer componente subscrito é notificado quando muda
  private avatarSubject = new BehaviorSubject<string | null>(this.getAvatar());
  avatar$ = this.avatarSubject.asObservable();

  // Monta o cabeçalho de autorização com o token atual, para usar em pedidos protegidos
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }

  // Regista um novo utilizador
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { username, email, password });
  }

  // Autentica o utilizador e, de seguida, vai buscar o perfil completo (para obter o avatar)
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        // Guarda o token e o username devolvidos pelo login, e limpa qualquer avatar antigo
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.removeItem('avatar');
        this.avatarSubject.next(null);
        this.usernameSubject.next(res.username);
      }),
      // Encadeia logo a seguir um pedido ao perfil, para ir buscar o avatar_url atual
      switchMap(() => this.getProfile()),
      tap((profile) => {
        if (profile.avatar_url) {
          const fullUrl = this.baseUrl + profile.avatar_url;
          localStorage.setItem('avatar', fullUrl);
          this.avatarSubject.next(fullUrl);
        }
      }),
      // Devolve ao chamador a mesma forma de resposta do AuthResponse original
      map(() => ({
        token: this.getToken()!,
        username: this.getUsername()!
      }))
    );
  }

  // Termina a sessão: limpa tudo do localStorage e notifica os subscribers
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    this.usernameSubject.next(null);
    this.avatarSubject.next(null);
  }

  // Vai buscar os dados de perfil do utilizador autenticado
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  // Atualiza dados do perfil (ex: username) e mantém o localStorage/Subject sincronizados
  updateProfile(data: { username?: string; email?: string; password?: string }): Observable<{ message: string; username: string; avatarUrl?: string }> {
    return this.http.put<{ message: string; username: string; avatarUrl?: string }>(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() }).pipe(
      tap((res) => {
        localStorage.setItem('username', res.username);
        this.usernameSubject.next(res.username);
      })
    );
  }

  // Faz o upload de uma nova imagem de avatar (via multipart/form-data)
  uploadAvatar(file: File): Observable<{ avatarUrl: string; username?: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.put<{ avatarUrl: string; username?: string }>(`${this.apiUrl}/profile`, formData, { headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }) }).pipe(
      tap((res) => {
        const fullUrl = this.baseUrl + res.avatarUrl;
        localStorage.setItem('avatar', fullUrl);
        this.avatarSubject.next(fullUrl);
      })
    );
  }

  // Helpers de leitura direta do localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getAvatar(): string | null {
    return localStorage.getItem('avatar');
  }

  // Indica se existe sessão ativa (token presente)
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}