import type { ArtPiece } from "@/@types";
import { render, screen } from "@testing-library/react";
import RequestPrintDialog from "./RequestPrintDialog";

const mockArtPiece = {
  id: "piece-1",
  title: "Windy Cliffside",
  artist_id: "artist-1",
  medium: "digital",
  aspect_ratio: "3:4",
  authorized_to_sell: true,
  not_ai_generated: true,
  px_width: 3600,
  px_height: 4800,
  artist: {
    id: "artist-1",
    name: "Test Artist",
    email_address: "artist@example.com",
  },
} as unknown as ArtPiece;

describe("RequestPrintDialog", () => {
  it("renders a heading and input elements with correct labels", () => {
    render(
      <RequestPrintDialog
        open={true}
        onOpenChange={() => {}}
        printOption="canvas"
        emailAddress="artist@example.com"
        artPiece={mockArtPiece}
        pxWidth={3600}
        pxHeight={4800}
      />,
    );
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Dimensions/)).toBeInTheDocument();
  });
});
