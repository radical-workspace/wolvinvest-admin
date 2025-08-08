// src/app/layout.tsx
import './globals.css'
import { AuthProvider } from '../../lib/AuthContext'

export const metadata = { title: 'Admin Wolvinvest', description: 'Next.js + Supabase Admin Dashboard' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
