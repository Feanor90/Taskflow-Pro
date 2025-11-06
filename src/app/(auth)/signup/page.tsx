import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card-floating w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}

