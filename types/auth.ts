export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface SessionData {
  user: AuthUser;
  expires: string;
}

