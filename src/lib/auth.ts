import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";

function getProviders(): NextAuthOptions["providers"] {
  const providers: NextAuthOptions["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: getProviders(),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only enforce restriction for OAuth sign-ins (not session checks)
      if (!account) return true;

      const email = user.email;
      if (!email) return "/login?error=GeenEmailAdres";

      // Check if user already exists in the database (pre-added by admin)
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!existingUser) {
        return "/login?error=NietGeautoriseerd";
      }

      return true;
    },
    session({ session, user }) {
      // Attach user ID and role to the session.
      // The PrismaAdapter fetches the full user record (include: { user: true }),
      // so role is already available — no extra DB query needed.
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role ?? "PLANNER";
      }
      return session;
    },
  },
};
