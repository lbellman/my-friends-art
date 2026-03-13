import { ArtPiece, getPublicUrl } from "@/@types";
import Link from "@/components/atoms/link/Link";
import Image from "next/image";

interface ArtCardProps {
  artPiece: ArtPiece;
  href: string;
}

export function ArtCard({ artPiece, href }: ArtCardProps) {
  const publicUrl = getPublicUrl(artPiece.display_path ?? "");
  return (
    <Link href={href}>
      <div className="group md:min-w-[200px]">
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
          <p className="uppercase-overline">{artPiece.medium}</p>
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
