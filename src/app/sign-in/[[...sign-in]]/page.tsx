import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="marketing-surface flex min-h-screen items-center justify-center px-4 py-16">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/app/collection"
      />
    </div>
  );
}
