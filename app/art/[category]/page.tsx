"use client";

import { ArtPiece } from "@/@types";
import useRestoreArtList from "@/app/hooks/useRestoreArtList";
import { ArtCard } from "@/components/molecules/art-card/ArtCard";
import InternalLayout from "@/components/organisms/InternalLayout";
import {
  ART_PIECES_PAGE_SIZE,
  PaginatedArtPieces,
} from "@/components/organisms/paginated-art-pieces/PaginatedArtPieces";
import { Skeleton } from "@/components/ui/skeleton";
import {
  mapRowsToArtPieces,
  pickFeaturedByArtist,
} from "@/lib/art-piece-sections";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const CATEGORY_CONFIG = {
  featured: { title: "featured", key: "featured" },
  "wall-art": { title: "wall art", key: "wall-art" },
  all: { title: "all pieces", key: "all" },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

function isCategoryKey(value: string): value is CategoryKey {
  return value in CATEGORY_CONFIG;
}

function CategoryPageContent() {
  const params = useParams<{ category: string }>();
  const category = params.category;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  if (!isCategoryKey(category)) {
    return (
      <InternalLayout
        title="art"
        back={{ href: "/", label: "back to home" }}
      >
        <p className="text-muted-foreground">Category not found.</p>
      </InternalLayout>
    );
  }

  const config = CATEGORY_CONFIG[category];

  const { data, isLoading } = useQuery({
    queryKey: ["art-category-page", category, page],
    queryFn: async () => {
      const baseSelect =
        "id, title, thumbnail_path, status, display_path, category, created_at, artist_id, artist:artist_id(id, name)";

      if (category === "featured") {
        const { data: rows, error } = await supabase
          .from("art_piece")
          .select(baseSelect)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(2000);

        if (error) throw new Error(error.message);
        const featuredAll = pickFeaturedByArtist(
          mapRowsToArtPieces(rows ?? []),
          Number.MAX_SAFE_INTEGER,
        ) as ArtPiece[];

        return {
          items: featuredAll,
          count: featuredAll.length,
          isClientPaged: true,
        };
      }

      const from = (page - 1) * ART_PIECES_PAGE_SIZE;
      const to = from + ART_PIECES_PAGE_SIZE - 1;
      const query = supabase
        .from("art_piece")
        .select(baseSelect, { count: "exact" })
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data: rows, error, count } =
        category === "wall-art"
          ? await query.eq("category", "wall-art")
          : await query;
      if (error) throw new Error(error.message);

      return {
        items: mapRowsToArtPieces(rows ?? []) as ArtPiece[],
        count: count ?? 0,
        isClientPaged: false,
      };
    },
  });

  useRestoreArtList({
    isLoading,
    namespace: `art-category-${category}`,
  });

  const totalCount = data?.count ?? 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / ART_PIECES_PAGE_SIZE)) : 0;

  const items =
    data?.isClientPaged
      ? (data.items ?? []).slice(
          (page - 1) * ART_PIECES_PAGE_SIZE,
          page * ART_PIECES_PAGE_SIZE,
        )
      : (data?.items ?? []);

  useEffect(() => {
    if (totalCount === 0 || totalPages === 0) return;
    if (page > totalPages) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("page", String(totalPages));
      router.replace(`${pathname}?${nextParams.toString()}`);
    }
  }, [page, pathname, router, searchParams, totalCount, totalPages]);

  return (
    <InternalLayout
      title={config.title}
      back={{ href: "/", label: "Back to home" }}
    >
      <PaginatedArtPieces
        items={items}
        totalCount={totalCount}
        page={page}
        pageSize={ART_PIECES_PAGE_SIZE}
        isLoading={isLoading}
        emptyContent={<p className="text-muted-foreground">No art pieces yet.</p>}
        onPageChange={(next) => {
          const nextParams = new URLSearchParams(searchParams.toString());
          nextParams.set("page", String(next));
          router.push(`${pathname}?${nextParams.toString()}`);
        }}
        renderArtPiece={(piece) => (
          <ArtCard
            artPiece={piece}
            href={`/${piece.id}?from=${encodeURIComponent(`${pathname}?${new URLSearchParams({ page: String(page) }).toString()}`)}`}
            listRestore={{ namespace: `art-category-${category}`, page }}
          />
        )}
        gridClassName="grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full"
      />
    </InternalLayout>
  );
}

function CategoryPageFallback() {
  return (
    <InternalLayout title="art" back={{ href: "/", label: "back to home" }}>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: ART_PIECES_PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-3/4 rounded-xl" />
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}

export default function ArtCategoryPage() {
  return (
    <Suspense fallback={<CategoryPageFallback />}>
      <CategoryPageContent />
    </Suspense>
  );
}
