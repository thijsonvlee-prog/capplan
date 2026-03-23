import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dev-only credentials check
        const devEmail = process.env.DEV_ADMIN_EMAIL;
        const devPassword = process.env.DEV_ADMIN_PASSWORD;

        if (
          credentials.email === devEmail &&
          credentials.password === devPassword
        ) {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: "Admin",
                role: "ADMIN",
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
    // Add OIDC provider when SSO is configured:
    // OIDCProvider({
    //   clientId: process.env.AUTH_OIDC_CLIENT_ID!,
    //   clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET!,
    //   issuer: process.env.AUTH_OIDC_ISSUER,
    // }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
