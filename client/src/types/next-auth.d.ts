import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      users_id: string; // Standardized User ID
      role: string;
      firstname: string;
      lastname: string;
    } & DefaultSession["user"];
  }

  interface User {
    users_id: string;
    role: string;
    firstname: string;
    lastname: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    users_id: string;
    role: string;
    firstname: string;
    lastname: string;
  }
}
