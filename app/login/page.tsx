import LoginClient from './login-client';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <LoginClient
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''}
    />
  );
}
