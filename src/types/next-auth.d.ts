import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      level?: number;
      xp?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    level?: number;
    xp?: number;
  }
}
