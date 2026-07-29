import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="marketing-surface flex min-h-screen items-center justify-center px-4 py-16">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/app/collection"
      />
    </div>
  );
}
