import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <SignIn routing="path" path="/login" signUpUrl="/signup" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
