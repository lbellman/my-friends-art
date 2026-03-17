import InternalLayout from "@/components/organisms/InternalLayout";
import ArtistLoginForm from "@/components/organisms/artist-login/ArtistLoginForm";
import { Suspense } from "react";

export default function ArtistLoginPage() {
  return (
    <InternalLayout title="artist login">
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <p className="text-muted-foreground body1 text-center">
          Sign in to access your artist portal. Once logged in, you&apos;ll be
          able to submit new pieces for review.
        </p>

        <Suspense fallback={null}>
          <ArtistLoginForm />
        </Suspense>
      </div>
    </InternalLayout>
  );
}
