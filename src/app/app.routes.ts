import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { GameListComponent } from './features/game-list/game-list.component';
import { GameDetailComponent } from './features/game-detail/game-detail.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'games', component: GameListComponent, canActivate: [authGuard] },
  { path: 'games/:id', component: GameDetailComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];