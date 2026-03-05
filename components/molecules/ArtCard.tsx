import { ArtPiece } from "@/app/page";
import Link from "@/components/atoms/Link";
import Image from "next/image";

interface ArtCardProps {
  artPiece: ArtPiece;
}

export function ArtCard({ artPiece }: ArtCardProps) {
  return (
    <Link href={`/${artPiece.id}`}>
      <div className="group">
        <div
          className={` relative overflow-hidden rounded-xl aspect-3/4 mb-4 transition-all duration-300 ease-out group-hover:shadow-xl group-hover:-translate-y-1`}
        >
          {artPiece.img_url ? (
            <Image
              src={artPiece.img_url}
              alt={artPiece.title}
              fill
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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

        <div className="space-y-2">
          <p className="uppercase-overline">{artPiece.medium}</p>
          <h5 className="text-foreground group-hover:text-primary-foreground transition-colors duration-300">
            {artPiece.title}
          </h5>
        </div>
      </div>
    </Link>
  );
}
