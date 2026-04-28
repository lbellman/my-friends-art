import { ArtistType, CHAR_LIMITS } from "@/@types";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import TextArea from "@/components/atoms/text-area/TextArea";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useEffect, useState } from "react";

type EditFormData = {
  name: string;
  bio: string;
  website: string;
  instagram: string;
  facebook: string;
};

export default function ProfileTab({
  artist,
  refetchArtist,
  isLoadingArtist,
}: {
  artist: ArtistType;
  refetchArtist: () => void;
  isLoadingArtist: boolean;
}) {
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: artist?.name ?? "",
    bio: artist?.bio ?? "",
    website: artist?.website ?? "",
    instagram: artist?.instagram ?? "",
    facebook: artist?.facebook ?? "",
  });

  useEffect(() => {
    if (!artist) return;
    setEditFormData({
      name: artist?.name ?? "",
      bio: artist?.bio ?? "",
      website: artist?.website ?? "",
      instagram: artist?.instagram ?? "",
      facebook: artist?.facebook ?? "",
    });
  }, [artist]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist?.id) return;

    setProfileError(null);
    setProfileSuccess(false);
    const trimmedName = editFormData.name.trim();
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
          bio: editFormData.bio.trim() || null,
          website: editFormData.website.trim() || null,
          instagram: editFormData.instagram.trim() || null,
          facebook: editFormData.facebook.trim() || null,
        })
        .eq("id", artist?.id);

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

  return (
    <section className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm space-y-4">
      <h6 className="text-foreground font-display tracking-wide">
        Your artist profile
      </h6>
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
            value={editFormData.name}
            onChange={(value) =>
              setEditFormData({ ...editFormData, name: value as string })
            }
            placeholder="Your display name as an artist"
            required
            maxLength={CHAR_LIMITS.artist_name}
          />
          <TextArea
            label="Bio"
            id="artist-bio"
            value={editFormData.bio}
            onChange={(value) =>
              setEditFormData({ ...editFormData, bio: value as string })
            }
            required
            placeholder="Tell visitors a bit about yourself and your work."
            maxLength={CHAR_LIMITS.artist_bio}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Website"
              id="artist-website"
              value={editFormData.website}
              onChange={(value) =>
                setEditFormData({ ...editFormData, website: value as string })
              }
              placeholder="https://example.com"
            />
            <Input
              label="Instagram"
              id="artist-instagram"
              value={editFormData.instagram}
              onChange={(value) =>
                setEditFormData({ ...editFormData, instagram: value as string })
              }
              placeholder="https://instagram.com/you"
            />
            <Input
              label="Facebook"
              id="artist-facebook"
              value={editFormData.facebook}
              onChange={(value) =>
                setEditFormData({ ...editFormData, facebook: value as string })
              }
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
  );
}
