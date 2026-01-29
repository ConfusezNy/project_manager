import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@doe.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (
          user &&
          user.passwordHash &&
          (await bcrypt.compare(credentials.password, user.passwordHash))
        ) {
          return {
            id: String(user.users_id),
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
          } as any;
        } else {
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.users_id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }: any) => {
      if (session?.user) {
        session.user.users_id = token.users_id;
        session.user.firstname = token.firstname;
        session.user.lastname = token.lastname;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export async function getAuthUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function requireAdvisorOrAdmin() {
  const user = await getAuthUser();
  if (!user || !["ADMIN", "ADVISOR"].includes(user.role)) return null;
  return user;
}
