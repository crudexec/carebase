import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            businesses: {
              include: { business: true },
              take: 1,
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.businessId = session.businessId;
      }

      // Get user's primary business if not set
      if (token.id && !token.businessId) {
        const membership = await db.businessMember.findFirst({
          where: { userId: token.id as string },
          include: { business: true },
          orderBy: { createdAt: "asc" },
        });

        if (membership) {
          token.businessId = membership.businessId;
          token.businessName = membership.business.name;
          token.role = membership.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.businessId = token.businessId as string | undefined;
        session.user.businessName = token.businessName as string | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
};

// Helper to get current session on server
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getCurrentBusiness() {
  const user = await getCurrentUser();
  if (!user?.businessId) return null;

  return db.business.findUnique({
    where: { id: user.businessId },
  });
}
