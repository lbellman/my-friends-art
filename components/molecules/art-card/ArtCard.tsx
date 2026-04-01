import { ArtPiece, getPublicUrl } from "@/@types";
import Link from "@/components/atoms/link/Link";
import { artListReturnStorageKey } from "@/lib/art-list-restore";
import Image from "next/image";

interface ArtCardProps {
  artPiece: ArtPiece;
  href: string;
  /** When set, persists list page + scroll Y for restoring the gallery after navigating back. */
  listRestore?: {
    namespace: string;
    page: number;
  };
}

export function ArtCard({ artPiece, href, listRestore }: ArtCardProps) {
  const publicUrl = getPublicUrl(artPiece.thumbnail_path ?? "");
  return (
    <Link
      href={href}
      className="block w-full max-w-full min-w-0"
      onClick={() => {
        if (typeof window === "undefined" || !listRestore) return;
        sessionStorage.setItem(
          artListReturnStorageKey(listRestore.namespace),
          JSON.stringify({
            page: listRestore.page,
            scrollY: window.scrollY,
          }),
        );
      }}
    >
      <div className="group md:min-w-[200px] w-full min-h-full size-full ">
        <div
          className={` relative overflow-hidden rounded-xl aspect-3/4 mb-4 transition-all duration-300 ease-out group-hover:shadow-xl group-hover:-translate-y-1`}
        >
          {publicUrl ? (
            <Image
              src={publicUrl}
              alt={artPiece.title}
              fill
              className="w-full h-full object-cover transition-transform duration-500 ease-out "
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-light text-muted-foreground/50 tracking-editorial">
                {artPiece.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        </div>

        <div className="space-y-1">
          <p className="uppercase-overline">{artPiece.category?.replaceAll("-", " ")}</p>
          <div className="flex items-center justify-between">
            <p className="text-foreground body1 font-medium group-hover:text-primary-foreground transition-colors duration-300">
              {artPiece.title}
            </p>
          </div>
          <p className="body2">{artPiece.artist?.name}</p>
        </div>
      </div>
    </Link>
  );
}
