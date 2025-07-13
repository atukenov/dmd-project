import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { findOne } from "@/lib/db";
import { getServerSession } from "next-auth";

// Define a function to create the adapter only when MongoDB is available
const getMongoDBAdapter = () => {
  try {
    // Only use MongoDB adapter if explicitly configured, otherwise use JWT
    if (process.env.MONGODB_URI && process.env.NODE_ENV === "production") {
      return MongoDBAdapter(clientPromise);
    }
    return undefined; // Use JWT strategy
  } catch {
    console.warn("Failed to create MongoDB adapter. Using JWT only.");
    return undefined;
  }
};

// Define the auth options
export const authOptions: NextAuthOptions = {
  adapter: getMongoDBAdapter(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Find user by email
          console.log(
            `Attempting to authenticate user: ${credentials.email.toLowerCase()}`
          );
          const user = await findOne("users", {
            email: credentials.email.toLowerCase(),
          });

          if (!user) {
            console.log(`User not found: ${credentials.email.toLowerCase()}`);
            return null;
          }

          console.log(`User found: ${user.email}, checking password...`);

          // Check password against passwordHash field (or password field for backward compatibility)
          const hashedPassword = user.passwordHash || user.password;

          if (!hashedPassword) {
            console.log("No password hash found in user record");
            return null;
          }

          const isValid = await compare(credentials.password, hashedPassword);

          console.log(
            `Password validation result: ${isValid ? "success" : "failed"}`
          );

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "client";
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      if (token.emailVerified) {
        session.user.emailVerified = token.emailVerified as Date;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful signin
      if (url.includes("/auth/signin")) {
        return `${baseUrl}/dashboard`;
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// Export an auth function that can be used in server components
export const auth = async () => {
  return await getServerSession(authOptions);
};
