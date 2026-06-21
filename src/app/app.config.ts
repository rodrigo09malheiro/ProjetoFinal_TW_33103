/**
 * app.config.ts
 * --------------------------------------------------------------------------
 * Configuração global da aplicação (standalone, sem NgModules).
 * Regista os providers principais: o router (com as rotas de app.routes.ts),
 * o HttpClient (para chamadas à API) e a deteção de erros em zona otimizada.
 * --------------------------------------------------------------------------
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Otimização: agrupa deteções de mudança em coalescência de eventos
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Regista as rotas definidas em app.routes.ts
    provideRouter(routes),
    // Permite injetar HttpClient em qualquer service/component da app
    provideHttpClient(),
  ],
};