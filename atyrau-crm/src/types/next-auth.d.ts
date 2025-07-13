import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      emailVerified?: Date;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    emailVerified?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    emailVerified?: Date;
  }
}
