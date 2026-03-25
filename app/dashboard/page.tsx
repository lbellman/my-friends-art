"use client";

import {
  type ArtPiece,
  ArtPieceStatusType,
  CHAR_LIMITS,
  type ProductRequestRow,
  type ProductRequestStatusType,
} from "@/@types";
import useAuth from "@/app/hooks/useAuth";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import TextArea from "@/components/atoms/text-area/TextArea";
import DashboardArtCard from "@/components/molecules/dashboard-art-card/DashboardArtCard";
import ProductRequestCard from "@/components/molecules/product-request-card/ProductRequestCard";
import InternalLayout from "@/components/organisms/InternalLayout";
import {
  ART_PIECES_PAGE_SIZE,
  PaginatedArtPieces,
} from "@/components/organisms/paginated-art-pieces/PaginatedArtPieces";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { Plus, User } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

export type DashboardArtPieceRow = {
  id: string;
  title: string;
  status: ArtPieceStatusType;
  thumbnail_path: string | null;
  display_path: string | null;
  created_at: string | null;
};

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  const {
    data: artist,
    isLoading: isLoadingArtist,
    refetch: refetchArtist,
  } = useQuery({
    queryKey: ["artist", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("artist")
        .select("id, name, bio, website, instagram, facebook")
        .eq("user_id", user?.id || "")
        .single();
      return data;
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
        .eq("status", "pending")
        .eq("artist_id", artist?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ProductRequestRow[];
    },
    enabled: !!artist?.id,
  });

  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      redirect("/");
    }
  }, [user, loading]);

  useEffect(() => {
    if (!artist) return;
    setArtistName(artist.name ?? "");
    setBio(artist.bio ?? "");
    setWebsite(artist.website ?? "");
    setInstagram(artist.instagram ?? "");
    setFacebook(artist.facebook ?? "");
  }, [artist]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist?.id) return;

    setProfileError(null);
    setProfileSuccess(false);
    const trimmedName = artistName.trim();
    if (!trimmedName) {
      setProfileError("Artist name is required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("artist")
        .update({
          name: trimmedName,
          bio: bio.trim() || null,
          website: website.trim() || null,
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
        })
        .eq("id", artist.id);

      if (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        setProfileError("Failed to update profile. Please try again.");
        return;
      }

      setProfileSuccess(true);
      void refetchArtist();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isLoading = isLoadingArtist || isLoadingPieces || loading;

  type ArtFilter = "all" | "approved" | "pending-approval" | "not-approved";
  const [artFilter, setArtFilter] = useState<ArtFilter>("all");
  const [showAllPrintRequests, setShowAllPrintRequests] = useState(false);

  const pickArtFilter = (f: ArtFilter) => {
    setArtFilter(f);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const displayProductRequests = showAllPrintRequests
    ? allProductRequests
    : allProductRequests.slice(0, 6);
  const hasMorePrintRequests = allProductRequests.length > 6;

  const handleUpdateProductRequestStatus = async (
    id: string,
    status: ProductRequestStatusType,
  ) => {
    await supabase.from("product_request").update({ status }).eq("id", id);
    void refetchProductRequests();
  };

  const filteredArtPieces = useMemo(
    () =>
      artPieces.filter((p) => {
        if (artFilter === "all") return true;
        return p.status === artFilter;
      }),
    [artPieces, artFilter],
  );

  const approvedCount = useMemo(
    () => artPieces.filter((p) => p.status === "approved").length,
    [artPieces],
  );
  const pendingCount = useMemo(
    () => artPieces.filter((p) => p.status === "pending-approval").length,
    [artPieces],
  );

  const totalCount = useMemo(() => artPieces.length, [artPieces]);

  const filteredTotalCount = filteredArtPieces.length;
  const filteredTotalPages =
    filteredTotalCount > 0
      ? Math.max(1, Math.ceil(filteredTotalCount / ART_PIECES_PAGE_SIZE))
      : 0;

  const pagedDashboardPieces = useMemo(() => {
    const from = (page - 1) * ART_PIECES_PAGE_SIZE;
    return filteredArtPieces.slice(from, from + ART_PIECES_PAGE_SIZE);
  }, [filteredArtPieces, page]);

  useEffect(() => {
    if (filteredTotalCount === 0 || filteredTotalPages === 0) return;
    if (page > filteredTotalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(filteredTotalPages));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    filteredTotalCount,
    filteredTotalPages,
    page,
    router,
    pathname,
    searchParams,
  ]);

  return (
    <InternalLayout title="artist dashboard">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-12">
        {/* Welcome & quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-72" />
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-foreground">
                  Welcome back{artist?.name ? `, ${artist.name}` : ""}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage your artist profile and art pieces.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/submit-art-piece">
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="size-4" />}
                label="Submit new piece"
              />
            </Link>
            <Link href="/account">
              <Button
                variant="secondary"
                size="sm"
                icon={<User className="size-4" />}
                label="Account"
              />
            </Link>
          </div>
        </div>

        {/* Artist profile */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="text-foreground font-display tracking-wide">
            Your artist profile
          </h4>
          {isLoadingArtist ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ) : !artist ? (
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find an artist profile linked to your account.
            </p>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Artist name"
                id="artist-name"
                value={artistName}
                onChange={(value) => setArtistName(value as string)}
                placeholder="Your display name as an artist"
                required
                maxLength={CHAR_LIMITS.artist_name}
              />
              <TextArea
                label="Bio"
                id="artist-bio"
                value={bio}
                onChange={(value) => setBio(value as string)}
                required
                placeholder="Tell visitors a bit about yourself and your work."
                maxLength={CHAR_LIMITS.artist_bio}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Website"
                  id="artist-website"
                  value={website}
                  onChange={(value) => setWebsite(value as string)}
                  placeholder="https://example.com"
                />
                <Input
                  label="Instagram"
                  id="artist-instagram"
                  value={instagram}
                  onChange={(value) => setInstagram(value as string)}
                  placeholder="https://instagram.com/you"
                />
                <Input
                  label="Facebook"
                  id="artist-facebook"
                  value={facebook}
                  onChange={(value) => setFacebook(value as string)}
                  placeholder="https://facebook.com/you"
                />
              </div>
              {profileError && (
                <p className="body2 text-destructive">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="body2 text-green-600">Profile updated.</p>
              )}
              <Button
                type="submit"
                label={isSavingProfile ? "Saving…" : "Save artist profile"}
                disabled={isSavingProfile}
                loading={isSavingProfile}
              />
            </form>
          )}
        </section>

        {/* Print requests */}
        <section className="space-y-4">
          <h4 className="text-foreground font-display tracking-wide">
            Pending product requests
          </h4>
          {isLoadingProductRequests ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : allProductRequests.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No product requests yet. Requests will appear here when someone
                requests to purchase your art.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {displayProductRequests.map((request) => {
                  const piece = artPieces.find(
                    (p) => p.id === request.art_piece_id,
                  );
                  const artPieceForCard: ArtPiece | null =
                    piece && artist
                      ? ({
                          ...piece,
                          artist: {
                            id: artist.id,
                            name: artist.name ?? "",
                            email_address: "",
                          },
                        } as ArtPiece)
                      : null;
                  if (!artPieceForCard) return null;
                  return (
                    <li key={request.id}>
                      <ProductRequestCard
                        request={request}
                        artPiece={artPieceForCard}
                        onChangeStatus={handleUpdateProductRequestStatus}
                        showImage
                      />
                    </li>
                  );
                })}
              </ul>
              {hasMorePrintRequests && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    label={
                      showAllPrintRequests
                        ? "Show less"
                        : `See all (${allProductRequests.length})`
                    }
                    onClick={() => setShowAllPrintRequests((prev) => !prev)}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* Your art pieces */}
        <section className="space-y-6 ">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h4 className="text-foreground font-display tracking-wide">
              Your art pieces
            </h4>
            {!isLoading && artPieces.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={artFilter === "all" ? "primary" : "secondary"}
                  label={`All (${totalCount})`}
                  onClick={() => pickArtFilter("all")}
                />
                <Button
                  type="button"
                  size="sm"
                  variant={artFilter === "approved" ? "primary" : "secondary"}
                  label={`Approved (${approvedCount})`}
                  onClick={() => pickArtFilter("approved")}
                />
                <Button
                  type="button"
                  size="sm"
                  variant={
                    artFilter === "pending-approval" ? "primary" : "secondary"
                  }
                  label={`Pending Approval (${pendingCount})`}
                  onClick={() => pickArtFilter("pending-approval")}
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <ul className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <li key={i} className="rounded-xl overflow-hidden">
                  <Skeleton className="aspect-3/4 w-full rounded-none" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                </li>
              ))}
            </ul>
          ) : artPieces.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven’t submitted any pieces yet.
              </p>
              <Link href="/submit-art-piece">
                <Button
                  icon={<Plus className="size-4" />}
                  label="Submit your first piece"
                />
              </Link>
            </div>
          ) : filteredArtPieces.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-2">
                {artFilter === "all" &&
                  "No art pieces match your current filters."}
                {artFilter === "approved" &&
                  "You don’t have any approved pieces yet."}
                {artFilter === "pending-approval" &&
                  "You don’t have any pieces pending approval right now."}
                {artFilter === "not-approved" &&
                  "You don’t have any not approved pieces right now."}
              </p>
              <p className="text-xs text-muted-foreground">
                Try selecting a different filter or submit a new piece.
              </p>
            </div>
          ) : (
            <PaginatedArtPieces
              items={pagedDashboardPieces}
              totalCount={filteredTotalCount}
              page={page}
              pageSize={ART_PIECES_PAGE_SIZE}
              isLoading={false}
              emptyContent={null}
              onPageChange={(next) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(next));
                router.push(`${pathname}?${params.toString()}`);
              }}
              renderArtPiece={(piece) => (
                <DashboardArtCard artPiece={piece} />
              )}
              gridClassName="grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full"
            />
          )}
        </section>
      </div>
    </InternalLayout>
  );
}

function DashboardPageFallback() {
  return (
    <InternalLayout title="artist dashboard">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-3/4 w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
