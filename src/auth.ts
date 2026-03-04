import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                try {
                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        let user = await prisma.user.findUnique({ where: { email } });

                        // Auto-seed default user if it doesn't exist
                        if (!user && email === 'admin@chianote.com' && password === 'admin123') {
                            const passwordHash = await bcrypt.hash('admin123', 10);
                            user = await prisma.user.create({
                                data: {
                                    email: 'admin@chianote.com',
                                    name: '기본 사용자',
                                    password: passwordHash,
                                }
                            });
                            return user;
                        }

                        if (!user) {
                            console.log("Login failed: User not found in database.");
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.password);

                        if (passwordsMatch) {
                            return user;
                        } else {
                            console.log("Login failed: Password mismatch.");
                        }
                    } else {
                        console.log("Login failed: Invalid credential format.", parsedCredentials.error);
                    }
                } catch (error) {
                    console.error("Authorization critical error:", error);
                }
                return null;
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        }
    }
}); 
