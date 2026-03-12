import "@testing-library/jest-dom";
import { renderWithProviders } from "./test-utils";
import { screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home", () => {
  it("renders a heading", () => {
    renderWithProviders(<Home />);

    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toBeInTheDocument();
  });
});
