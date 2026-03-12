// components/molecules/ArtCard.test.tsx
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RequestPrintDialog from "./RequestPrintDialog";
import userEvent from "@testing-library/user-event";

describe("RequestPrintDialog", () => {
  it("renders a heading and input elements with correct labels", () => {
    render(
      <RequestPrintDialog
        open={true}
        onOpenChange={() => {}}
        printDetails={{
          title: "Windy Cliffside",
          dimensions: "8x10",
          printOption: "canvas",
        }}
        dimensionOptions={[
          { width: 8, height: 10 },
          { width: 10, height: 12 },
          { width: 12, height: 16 },
        ]}
        loadingDimensionOptions={false}
        emailAddress="artist@example.com"
      />,
    );
    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toBeInTheDocument();
    const emailInput = screen.getByLabelText("Email address");
    expect(emailInput).toBeInTheDocument();
    

  });
});
