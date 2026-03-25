"use client";
import InternalLayout from "@/components/organisms/InternalLayout";
import { ArtCard } from "@/components/molecules/art-card/ArtCard";
import {
  ART_PIECES_PAGE_SIZE,
  PaginatedArtPieces,
} from "@/components/organisms/paginated-art-pieces/PaginatedArtPieces";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { ArtistType, ArtPiece } from "@/@types";
import { lowerCase } from "lodash";
import { ArtistCard } from "@/components/molecules/artist-card/ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, useEffect } from "react";
import useRestoreArtList from "@/app/hooks/useRestoreArtList";

function ArtistDetailContent() {
  const { artistId } = useParams<{ artistId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  const { data: artist, isLoading: isLoadingArtist } =
    useQuery<ArtistType | null>({
      queryKey: ["artist", artistId],
      queryFn: async () => {
        if (!artistId) return null;
        const { data, error } = await supabase
          .from("artist")
          .select("*")
          .eq("id", artistId as string)
          .single();
        if (error) throw new Error(error.message);
        return data as ArtistType;
      },
    });

  const { data, isLoading: isLoadingArtPieces } = useQuery({
    queryKey: ["artist-art-pieces", artistId, page],
    queryFn: async () => {
      if (!artistId) return { items: [] as ArtPiece[], count: 0 };
      const from = (page - 1) * ART_PIECES_PAGE_SIZE;
      const to = from + ART_PIECES_PAGE_SIZE - 1;
      const {
        data: rows,
        error,
        count,
      } = await supabase
        .from("art_piece")
        .select("*, artist ( id, name )", { count: "exact" })
        .eq("artist_id", artistId as string)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      return {
        items: (rows ?? []) as ArtPiece[],
        count: count ?? 0,
      };
    },
  });

  useRestoreArtList({
    isLoading: isLoadingArtPieces || isLoadingArtist,
    namespace: "artist-detail",
  });

  const totalCount = data?.count ?? 0;
  const artPieces = data?.items ?? [];
  const totalPages =
    totalCount > 0
      ? Math.max(1, Math.ceil(totalCount / ART_PIECES_PAGE_SIZE))
      : 0;

  useEffect(() => {
    if (totalCount === 0 || totalPages === 0) return;
    if (page > totalPages) {
      router.replace(`${pathname}?page=${totalPages}`);
    }
  }, [totalCount, totalPages, page, router, pathname]);

  return (
    <InternalLayout
      title={
        artist?.name ? lowerCase(`About ${artist.name}`) : "about the artist"
      }
      back={{
        href: "/artists",
        label: "Back to all artists",
      }}
    >
      <div className="mx-auto items-center flex w-full max-w-5xl flex-col gap-10">
        {isLoadingArtist ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : artist ? (
          <section className="">
            <ArtistCard artist={artist} />
          </section>
        ) : (
          <p className="text-muted-foreground">Artist not found.</p>
        )}

        <section className="flex flex-col gap-4 mt-8 w-full">
          <h4 className="font-display tracking-wide mb-4 text-foreground">
            Art by {artist?.name ?? "this artist"}
          </h4>

          <PaginatedArtPieces
            items={artPieces}
            totalCount={totalCount}
            page={page}
            pageSize={ART_PIECES_PAGE_SIZE}
            isLoading={isLoadingArtPieces}
            emptyContent={
              <p className="text-muted-foreground">
                This artist doesn&apos;t have any pieces published yet.
              </p>
            }
            onPageChange={(next) => {
              router.push(`${pathname}?page=${next}`);
            }}
            renderArtPiece={(piece) => (
              <ArtCard
                artPiece={piece}
                href={`/artists/${artistId}/${piece.id}`}
                listRestore={{ namespace: "artist-detail", page }}
              />
            )}
            gridClassName="grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          />
        </section>
      </div>
    </InternalLayout>
  );
}

function ArtistDetailFallback() {
  return (
    <InternalLayout title="about the artist">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: ART_PIECES_PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}

export default function ArtistDetailPage() {
  return (
    <Suspense fallback={<ArtistDetailFallback />}>
      <ArtistDetailContent />
    </Suspense>
  );
}
