import { ArtistType, getPublicUrl } from "@/@types";
import Link from "@/components/atoms/link/Link";
import Image from "next/image";
import { Globe, Mail, MapPin } from "lucide-react";

interface ArtistCardProps {
  artist: ArtistType;
  linkHref?: string;
  linkText?: string;
}

export function ArtistCard({ artist, linkHref, linkText }: ArtistCardProps) {
  const profileSrc = artist.profile_img_url
    ? getPublicUrl("profile-pictures", artist.profile_img_url)
    : null;
  const hasSocialLinks =
    artist.website?.trim() ||
    artist.instagram?.trim() ||
    artist.facebook?.trim();
  return (
    <article
      id={artist.id}
      className="flex flex-col sm:flex-row gap-0 overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm border border-border"
    >
      <div className="relative w-full sm:w-64 h-64 sm:h-auto sm:min-h-[280px] shrink-0">
        {profileSrc ? (
          <Image
            src={profileSrc}
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
          <h6 className="text-foreground">{artist.name}</h6>
          {linkHref && linkText && <Link href={linkHref}>{linkText}</Link>}
        </div>

        {artist.location && (
          <span className="flex items-center gap-2 text-sm ">
            <MapPin className="size-4 shrink-0 " aria-hidden />
            {artist.location}
          </span>
        )}

        {artist.bio && (
          <p className="body2 text-muted-foreground whitespace-pre-wrap flex-1">
            {artist.bio}
          </p>
        )}
        {hasSocialLinks ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm md:justify-end text-foreground  mt-auto">
            {artist.website?.trim() && (
              <span className="flex items-center gap-2">
                <Globe className="size-4 shrink-0" aria-hidden />
                <Link href={artist.website.trim()}>Website</Link>
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
                <Link href={artist.instagram.trim()}>Instagram</Link>
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
                <Link href={artist.facebook.trim()}>Facebook</Link>
              </span>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
