import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'environments/environment';

const baseProviders = [
  provideRouter(routes),
  provideClientHydration(),
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
