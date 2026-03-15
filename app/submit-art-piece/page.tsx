import InternalLayout from "@/components/organisms/InternalLayout";

export default function ArtPieceSubmission() {
  return (
    <InternalLayout title="submit an art piece">
      <div className="h-full min-h-screen">
        <iframe
          src="https://tally.so/embed/Pd01MQ?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          width="100%"
          height="1100"
          frameBorder="0"
          title="Art Piece Submission Form"
        />
      </div>
    </InternalLayout>
  );
}
