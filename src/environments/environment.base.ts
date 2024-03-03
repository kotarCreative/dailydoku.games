type Environment = {
  firebaseConfig: {
      projectId: string;
      appId: string | undefined;
      storageBucket: string;
      apiKey: string;
      authDomain: string;
      messagingSenderId: string;
      measurementId: string;
  };
};

export const environment: Environment = {
  firebaseConfig: {
    projectId: 'dailydoku-31cec',
    appId: import.meta.env.DAILY_DOKU_FIREBASE_APP_ID,
    storageBucket: 'dailydoku-31cec.appspot.com',
    apiKey: import.meta.env.DAILY_DOKU_FIREBASE_API_KEY,
    authDomain: 'dailydoku-31cec.firebaseapp.com',
    messagingSenderId: import.meta.env.DAILY_DOKU_FIREBASE_MESSENGING_SENDER_ID,
    measurementId: import.meta.env.DAILY_DOKU_FIREBASE_MEASUREMENT_ID,
  },
};
