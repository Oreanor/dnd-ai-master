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

export interface AuthConfig {
  providers: AuthProvider[];
  callbacks: {
    session: (params: { session: SessionData; token: any }) => Promise<SessionData>;
    jwt: (params: { token: any; account: any; profile: any }) => Promise<any>;
  };
  pages: {
    signIn: string;
  };
  secret: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: string;
}
