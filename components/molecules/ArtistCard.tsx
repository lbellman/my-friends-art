import { ArtistType } from "@/@types";
import Link from "@/components/atoms/Link";
import Image from "next/image";
import { Globe, Mail, MapPin } from "lucide-react";

interface ArtistCardProps {
  artist: ArtistType;
  linkHref?: string;
  linkText?: string;
}

export function ArtistCard({ artist, linkHref, linkText }: ArtistCardProps) {
  return (
    <article
      id={artist.id}
      className="flex flex-col sm:flex-row gap-0 overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm border border-border"
    >
      <div className="relative w-full sm:w-64 h-64 sm:h-auto sm:min-h-[280px] shrink-0">
        {artist.profile_img_url ? (
          <Image
            src={artist.profile_img_url}
            alt={artist.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            <span className="text-4xl font-display text-foreground/60">
              {artist.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-6 sm:p-8 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {artist.name}
          </h2>
          {linkHref && linkText && <Link href={linkHref}>{linkText}</Link>}
        </div>

        <div className="flex flex-col gap-2  text-sm text-foreground">
          {artist.location && (
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {artist.location}
            </span>
          )}
          {artist.email_address?.trim() && (
            <a
              href={`mailto:${artist.email_address.trim()}`}
              className="flex items-center gap-2 text-foreground hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              {artist.email_address.trim()}
            </a>
          )}
          {artist.website?.trim() && (
            <span className="flex items-center gap-2">
              <Globe className="size-4 shrink-0" aria-hidden />
              {artist.website.trim()}
            </span>
          )}
          {artist.instagram?.trim() && (
            <span className="flex items-center gap-2">
              <Image
                src="/instagram-logo.svg"
                alt=""
                width={16}
                height={16}
                className="shrink-0"
                aria-hidden
              />
              {artist.instagram.trim()}
            </span>
          )}
          {artist.facebook?.trim() && (
            <span className="flex items-center gap-2">
              <Image
                src="/facebook-logo.png"
                alt=""
                width={16}
                height={16}
                className="shrink-0"
                aria-hidden
              />
              {artist.facebook.trim()}
            </span>
          )}
        </div>

        {artist.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {artist.bio}
          </p>
        )}
      </div>
    </article>
  );
}
