import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import { ensureAuthUrl } from '@/lib/site-url'

ensureAuthUrl()

function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anon, { auth: { persistSession: false } })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()
        const password = credentials.password as string

        try {
          const supabase = supabasePublic()
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error || !data.user) {
            console.error('[auth] signInWithPassword error:', error?.message)
            return null
          }

          return {
            id: data.user.id,
            email: data.user.email ?? email,
            name: (data.user.user_metadata?.name as string | undefined) ?? null,
          }
        } catch (err) {
          console.error('[auth] authorize unexpected error:', err)
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
