// components/molecules/ArtCard.test.tsx
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PrintDimensionsCalculator } from "./PrintDimensionsCalculator";
import userEvent from "@testing-library/user-event";

describe("PrintDimensionsCalculator", () => {
  it("renders a heading and input elements with correct labels", () => {
    render(<PrintDimensionsCalculator />);

    expect(
      screen.getByRole("heading", { name: "Print dimensions calculator" }),
    ).toBeInTheDocument();

    // Renders inputs with labels
    const pxWidthInput = screen.getByLabelText("Pixel width");
    const pxHeightInput = screen.getByLabelText("Pixel height");
    const dpiInput = screen.getByLabelText("DPI");

    expect(pxWidthInput).toBeInTheDocument();
    expect(pxHeightInput).toBeInTheDocument();
    expect(dpiInput).toBeInTheDocument();
  });

  it("shows an error message when it receives invalid pixel dimensions", async () => {
    render(<PrintDimensionsCalculator />);
    const user = userEvent.setup();

    const pxWidthInput = screen.getByLabelText("Pixel width");
    const pxHeightInput = screen.getByLabelText("Pixel height");
    const dpiInput = screen.getByLabelText("DPI");

    // Invalid pixel dimensions, valid DPI
    await user.type(pxWidthInput, "invalid");
    await user.type(pxHeightInput, "invalid");
    await user.type(dpiInput, "300");
    await user.click(
      screen.getByRole("button", { name: "Get print dimensions" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Please enter valid pixel width and height."),
      ).toBeInTheDocument();
    });

    await user.clear(pxWidthInput);
    await user.clear(pxHeightInput);
    await user.clear(dpiInput);

    // Valid pixel dimensions, invalid DPI
    await user.type(pxWidthInput, "3000");
    await user.type(pxHeightInput, "6000");
    await user.type(dpiInput, "invalid");

    await user.click(
      screen.getByRole("button", { name: "Get print dimensions" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid DPI.")).toBeInTheDocument();
    });
  });

  it("shows dimensions when a valid input is provided", async () => {
    render(<PrintDimensionsCalculator />);
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const pxWidthInput = screen.getByLabelText("Pixel width");
    const pxHeightInput = screen.getByLabelText("Pixel height");
    const dpiInput = screen.getByLabelText("DPI");

    await user.type(pxWidthInput, "1000");
    await user.type(pxHeightInput, "1000");
    await user.type(dpiInput, "300");

    await user.click(
      screen.getByRole("button", { name: "Get print dimensions" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Available print dimensions (width × height in inches)",
        ),
      ).toBeInTheDocument();

      // List of dimensions is greater than 0
      const dimensionsList = screen.getByRole("list");
      expect(dimensionsList).toBeInTheDocument();
      expect(dimensionsList.children.length).toBeGreaterThan(0);
    });
  });
});
