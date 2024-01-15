import {PrismaAdapter} from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import  CredentialsProvider  from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'


export const authOptions:NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {label: 'email', type: 'text'},
        password: {label: 'password', type: 'password'}
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email or password doesn't exist.")
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })
        if (!user || !user?.hashedPassword) {
          throw new Error('User not found')
        }
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )
        if (!isCorrectPassword) {
          throw new Error('Invalid password')
        }
        return user
      }
    })
  ],
  session: {
    strategy: 'jwt'
  }
}

export const getAuthSession = async() => {
  const session = await getServerSession(authOptions)
  // console.log('session', session)
  if (!session || !session.user?.email) {
    return null
  }
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: session.user.email
    }
  })
  return user
}