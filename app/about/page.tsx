import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12 flex flex-col items-center flex-nowrap">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col flex-nowrap items-center">
          <header>
            <h1 className="font-display ">About</h1>
          </header>
          {/* Image and Content */}
          <div className="flex justify-center flex-col md:flex-row gap-8 py-12">
            <div className="flex flex-col flex-nowrap gap-6 flex-1">
              <h2 className="font-display">About the Artist</h2>
              <p className="flex-1">
                My name is Lindsey, and I am a hobby artist. I paint and sketch
                in all mediums, and I often gift my work to friends and family.
                I am also blessed with many talented friends who&apos;s art I
                have hanging all over my house. My Friend&apos;s Art began as a
                personal marketplace to showcase my own work and maybe sell a
                print or two, but after a few weeks I realized it could be so
                much more than that. I have so many incredible friends who
                create art only for themselves and select friends and family.
                Beautiful, compelling pieces that resulted from paint nights,
                mushroom trips, afternoons at the park, and just general
                creativity. These talented individuals might never consider
                themselves artists, and yet 
                <span className="font-semibold text-primary-foreground">
                  I would pay to have their art in my home.
                </span>
              </p>
            </div>
            <div className="">
              <Image
                src="/headshot.webp"
                alt="Lindsey"
                width={250}
                height={250}
                className="rounded-lg"
              />
            </div>
          </div>
          {/* What This Is */}
          <div className="flex flex-col flex-nowrap gap-6">
            <h2 className="font-display">What This Is</h2>
            <p>
              The goal is simple: Create a community where anyone can showcase
              and sell their work, make it easy for people to purchase
              meaningful art that was made by a human, and keep the
              process affordable, friendly, and transparent.
            </p>
          </div>
          {/* The Vision */}
          <div className="flex flex-col flex-nowrap gap-6 mt-12">
            <h2 className="font-display">The Vision</h2>
            <p>
              Rather than focusing on how to make the most money, the idea is to
              give everyone a place to appreciate and support the creativity of
              their friends, especially the ones who are still strangers. <br />
              <br />
              Anyone who creates something they are proud of is welcome on this
              platform. Fill out an application to become an artist, and then
              start uploading your work! You set your own base price as an
              artist, but sizing, print options, and shipping logistics are all
              handled by the platform. Above all, this is an artist-first
              community. The goal is to bring people together in appreciation of
              our unique talents and creativity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
