import type { Metadata } from "next";
import { Paintbrush } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Back soon — My Friend's Art",
  description: "We are performing scheduled maintenance.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  if (process.env.MAINTENANCE_MODE !== "true") {
    redirect("/");
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div
        className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary"
        aria-hidden
      >
        <Paintbrush className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        Down for maintenance
      </h1>
      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">
        I am fixing bugs and making things a little nicer. Check back soon—we will be up and
        running again shortly.
      </p>
    </div>
  );
}
