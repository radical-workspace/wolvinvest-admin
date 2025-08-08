# Authentication Setup Guide

This project includes a complete authentication system using Supabase and React Context.

## Files Created

- `lib/supabaseClient.ts` - Supabase client configuration
- `lib/AuthContext.tsx` - Authentication context and provider
- `.env.local.example` - Environment variables template

## Setup Instructions

1. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Replace the placeholder values with your actual Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```

2. **Set up Supabase Database**
   
   Create a `users` table in your Supabase database:
   ```sql
   CREATE TABLE users (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT,
     role TEXT DEFAULT 'user',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view their own profile" ON users
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update their own profile" ON users
     FOR UPDATE USING (auth.uid() = id);
   ```

3. **Set up Database Trigger (Optional)**
   
   Create a trigger to automatically insert user records when someone signs up:
   ```sql
   -- Function to handle new user signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, email)
     VALUES (NEW.id, NEW.email);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Trigger to call the function
   CREATE OR REPLACE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

## Usage

The authentication context provides the following:

- `session` - Current user session
- `user` - User profile with additional data (including role)
- `signIn(email, password)` - Sign in function
- `signUp(email, password)` - Sign up function
- `signOut()` - Sign out function

### Example Usage

```tsx
'use client';
import { useAuth } from '../lib/AuthContext';

export default function MyComponent() {
  const { session, user, signIn, signOut } = useAuth();

  if (!session) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      {user?.role && <p>Role: {user.role}</p>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Features

- ✅ User authentication (sign in/up/out)
- ✅ Session management
- ✅ User profile with roles
- ✅ Automatic session persistence
- ✅ TypeScript support
- ✅ Row Level Security ready

## Next Steps

1. Configure your Supabase project
2. Set up the database tables
3. Add your environment variables
4. Customize the user roles and permissions as needed
