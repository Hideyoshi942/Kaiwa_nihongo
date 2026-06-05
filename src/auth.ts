import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbUserToProfile, getUserByEmail } from "@/lib/db/queries";
import { isDbEnabled } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!isDbEnabled()) return null;

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await getUserByEmail(email);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const profile = dbUserToProfile(user);
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          level: profile.level,
          xp: profile.xp,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.level = (user as { level?: number }).level;
        token.xp = (user as { xp?: number }).xp;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { level?: number }).level = token.level as number;
        (session.user as { xp?: number }).xp = token.xp as number;
      }
      return session;
    },
  },
});
