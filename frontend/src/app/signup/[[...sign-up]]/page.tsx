import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <SignUp routing="path" path="/signup" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
