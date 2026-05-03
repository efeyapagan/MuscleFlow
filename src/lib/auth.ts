import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      authorize: async (credentials) => {
        // TODO: DB entegrasyonu hazır olduğunda buraya kullanıcı doğrulaması ekle
        // const user = await db.user.findUnique({ where: { email: credentials.email } })
        // if (!user || !verifyPassword(credentials.password, user.passwordHash)) return null
        // return { id: user.id, name: user.name, email: user.email }
        if (!credentials?.email || !credentials?.password) return null
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub },
    }),
  },
})
