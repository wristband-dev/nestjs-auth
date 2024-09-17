export interface RequestWithSession extends Request {
  session: {
    isAuthenticated: boolean;
    accessToken: string;
    csrfSecret: string;
    refreshToken: string;
    expiresAt: number;
    save: () => Promise<void>;
  }
}
