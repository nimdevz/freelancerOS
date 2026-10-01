export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN?: string;
  JWT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  R2_BUCKET?: R2Bucket;
  BACKGROUND_QUEUE?: Queue<any>;
}

export interface AppVariables {
  userId?: string;
  organizationId?: string;
}
