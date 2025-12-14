import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@auth/prisma-adapter'

const prisma = new PrismaClient()

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials) return null
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        })

        if (
          user &&
          (await bcrypt.compare(credentials.password, user.passwordHash))
        ) {
          return {
            id: user.users_id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role:user.role
          }
        } else {
          throw new Error('Invalid email or password')
        }
      },
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.firstname = user.firstname      // ⚠️ เพิ่มบรรทัดนี้
      token.lastname = user.lastname        // ⚠️ เพิ่มบรรทัดนี้
      token.role = user.role 
      }
      return token
    },
   session: async ({ session, token }) => {
  if (session.user) {
    session.user.id = token.id
    session.user.firstname = token.firstname
    session.user.lastname = token.lastname
    session.user.role = token.role
  }
  return session
}
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }