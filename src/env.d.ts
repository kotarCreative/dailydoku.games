interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  /**
   * Built-in environment variable.
   * @see Docs https://github.com/chihab/dotenv-run/packages/angular#node_env.
   */
  readonly NODE_ENV: string;
  // Add your environment variables below
  readonly NG_APP_FIREBASE_APP_ID: string;
  readonly NG_APP_FIREBASE_API_KEY: string;
  readonly NG_APP_FIREBASE_MESSENGING_SENDER_ID: string;
  readonly NG_APP_FIREBASE_MEASUREMENT_ID: string;
  [key: string]: any;
}
