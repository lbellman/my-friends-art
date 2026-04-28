"use client";

import {
  ArtistType,
  ArtPieceStatusType,
  type ProductRequestRow,
} from "@/@types";
import useAuth from "@/app/hooks/useAuth";
import useRestoreDashboard from "@/app/hooks/useRestoreDashboard";
import Button from "@/components/atoms/button/Button";
import InternalLayout from "@/components/organisms/InternalLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtPiecesTab from "@/components/views/ArtistDashboardView/ArtPiecesTab";
import ProductRequestsTab from "@/components/views/ArtistDashboardView/ProductRequestsTab";
import ProfileTab from "@/components/views/ArtistDashboardView/ProfileTab";
import supabase from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Plus,
  UserRound,
  Palette,
  Inbox,
  List,
} from "lucide-react";
import Link from "next/link";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useMemo } from "react";

export type DashboardArtPieceRow = {
  id: string;
  title: string;
  status: ArtPieceStatusType;
  thumbnail_path: string | null;
  display_path: string | null;
  created_at: string | null;
};

function parseDashboardTab(
  raw: string | null,
): "profile" | "art-pieces" | "product-requests" {
  if (raw === "profile" || raw === "art-pieces" || raw === "product-requests") {
    return raw;
  }
  return "profile";
}

export default function ArtistDashboardView() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseDashboardTab(searchParams.get("tab"));

  const {
    data: artist,
    isLoading: isLoadingArtist,
    refetch: refetchArtist,
  } = useQuery({
    queryKey: ["artist", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("artist")
        .select("*")
        .eq("user_id", user?.id || "")
        .single();
      return data as ArtistType;
    },
    enabled: !!user?.id,
  });

  const { data: artPieces = [], isLoading: isLoadingPieces } = useQuery({
    queryKey: ["art-pieces", artist?.id],
    queryFn: async (): Promise<DashboardArtPieceRow[]> => {
      const { data } = await supabase
        .from("art_piece")
        .select("id, title, status, thumbnail_path, display_path, created_at")
        .eq("artist_id", artist?.id || "")
        .order("created_at", { ascending: false });
      return (data ?? []) as DashboardArtPieceRow[];
    },
    enabled: !!artist?.id,
  });

  const {
    data: allProductRequests = [],
    isLoading: isLoadingProductRequests,
    refetch: refetchProductRequests,
  } = useQuery({
    queryKey: ["product-requests-dashboard", artist?.id],
    queryFn: async (): Promise<ProductRequestRow[]> => {
      const { data, error } = await supabase
        .from("product_request")
        .select(
          "id, name, from_email, message, dimensions, print_option, created_at, status, type, art_piece_id",
        )
        .eq("artist_id", artist?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ProductRequestRow[];
    },
    enabled: !!artist?.id,
  });

  useEffect(() => {
    if (!user && !loading) {
      redirect("/");
    }
  }, [user, loading]);

  useEffect(() => {
    const raw = searchParams.get("tab");
    if (
      raw != null &&
      raw !== "profile" &&
      raw !== "art-pieces" &&
      raw !== "product-requests"
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const isLoading = isLoadingArtist || isLoadingPieces || loading;

  useRestoreDashboard({ isLoading });

  const pendingRequestCount = useMemo(
    () => allProductRequests.filter((r) => r.status === "pending").length,
    [allProductRequests],
  );
  const approvedPieceCount = useMemo(
    () => artPieces.filter((p) => p.status === "approved").length,
    [artPieces],
  );
  const hasPendingProductRequests = pendingRequestCount > 0;

  return (
    <InternalLayout>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
        {/* Welcome back card */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm "
          aria-labelledby="dashboard-welcome-heading"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-primary/20 via-primary/10 to-transparent"
            aria-hidden
          />
          <div className="relative px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4 sm:gap-5">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-inner border border-primary/10 sm:size-12"
                  aria-hidden
                >
                  <LayoutDashboard className="size-5 sm:size-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  {isLoading ? (
                    <div className="space-y-3 pt-0.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-8 w-64 max-w-full" />
                      <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                  ) : (
                    <>
                      <p className="uppercase-overline">Artist dashboard</p>
                      <h1
                        id="dashboard-welcome-heading"
                        className="font-display text-2xl text-foreground sm:text-3xl"
                      >
                        Welcome back
                        {artist?.name ? (
                          <span className="text-foreground">
                            , {artist.name}
                          </span>
                        ) : null}
                      </h1>
                      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Manage your artist profile, art pieces, and product
                        requests.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:shrink-0 lg:pt-1">
                <Link href="/submit-art-piece">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="size-4" />}
                    label="Submit new piece"
                  />
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-17 rounded-xl" />
                ))}
              </div>
            ) : (
              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:gap-4">
                <div className="rounded-xl border border-border/60 bg-muted/35 px-4 py-3.5 dark:bg-muted/15">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Art pieces
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {artPieces.length}
                  </dd>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/35 px-4 py-3.5 dark:bg-muted/15">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Approved
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {approvedPieceCount}
                  </dd>
                </div>
                <div
                  className={cn(
                    "col-span-2 rounded-xl border px-4 py-3.5 sm:col-span-1",
                    pendingRequestCount > 0
                      ? "border-destructive/25 bg-destructive/6 dark:bg-destructive/10"
                      : "border-border/60 bg-muted/35 dark:bg-muted/15",
                  )}
                >
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    Pending requests
                    {pendingRequestCount > 0 ? (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-destructive"
                        title="Needs your attention"
                        aria-hidden
                      />
                    ) : null}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {pendingRequestCount}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex">
          <Tabs
            value={activeTab}
            onValueChange={(next) => {
              const params = new URLSearchParams(searchParams.toString());
              if (next === "profile") {
                params.delete("tab");
              } else {
                params.set("tab", next);
              }
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
            }}
            className="gap-6 w-full"
          >
            <div className="overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="w-max flex-nowrap h-auto min-h-9 justify-start whitespace-nowrap">
                <TabsTrigger value="profile" className="flex-none">
                  <UserRound className="size-4 sm:hidden" aria-hidden />
                  <span className="sr-only sm:not-sr-only">Artist Profile</span>
                </TabsTrigger>
                <TabsTrigger value="art-pieces" className="flex-none">
                  <List className="size-4 sm:hidden" aria-hidden />
                  <span className="sr-only sm:not-sr-only">
                    Your Pieces{" "}
                    {isLoadingPieces ? null : `(${artPieces.length})`}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="product-requests"
                  className="flex-none"
                  title={
                    hasPendingProductRequests
                      ? "You have pending product requests"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <Inbox className="size-4 sm:hidden" aria-hidden />
                    <span className="sr-only sm:not-sr-only">
                      Product Requests
                    </span>
                    {hasPendingProductRequests ? (
                      <span
                        className="size-2 shrink-0 rounded-full bg-destructive"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="mt-6 w-full">
              <ProfileTab
                artist={artist as ArtistType}
                refetchArtist={refetchArtist}
                isLoadingArtist={isLoadingArtist}
              />
            </TabsContent>

            <TabsContent value="product-requests" className="mt-6">
              <ProductRequestsTab
                artist={artist as ArtistType}
                artPieces={artPieces as DashboardArtPieceRow[]}
                allProductRequests={allProductRequests as ProductRequestRow[]}
                refetchProductRequests={refetchProductRequests}
                isLoadingProductRequests={isLoadingProductRequests}
              />
            </TabsContent>

            <TabsContent value="art-pieces" className="mt-6">
              <ArtPiecesTab
                artPieces={artPieces as DashboardArtPieceRow[]}
                isLoading={isLoadingPieces}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </InternalLayout>
  );
}
