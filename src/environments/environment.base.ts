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
  production?: boolean;
};

export const environment: Environment = {
  firebaseConfig: {
    projectId: 'dailydoku-31cec',
    appId: '1:37448727900:web:7335a0b9aeb26acfead599',
    storageBucket: 'dailydoku-31cec.appspot.com',
    apiKey: 'AIzaSyAjhuZWEjOD-SFMMhkNFtRi4GGOoffxn5c',
    authDomain: 'dailydoku-31cec.firebaseapp.com',
    messagingSenderId: '37448727900',
    measurementId: 'G-MB7J5FB3TN',
  },
};
