import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { environment } from 'environments/environment';

const baseProviders = [
  provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  provideHttpClient(withFetch()),
  provideClientHydration(withEventReplay()),
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideFirestore(() => getFirestore()),
];

const devProviders = [...baseProviders];

const prodProviders = [
  ...baseProviders,
  provideAnalytics(() => getAnalytics()),
  provideAuth(() => getAuth()),
];

export const appConfig: ApplicationConfig = {
  providers: environment.production ? prodProviders : devProviders,
};
