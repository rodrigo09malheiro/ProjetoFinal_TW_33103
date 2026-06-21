/**
 * main.ts
 * --------------------------------------------------------------------------
 * Ponto de entrada (entry point) da aplicação Angular.
 * Faz o bootstrap (arranque) do componente raiz (AppComponent) usando a
 * configuração definida em app.config.ts (rotas, providers, HttpClient, etc.).
 * --------------------------------------------------------------------------
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));