import { throttle } from "lodash";
import { useEffect } from "react";


export default function useHighlightedSectionAnchors({
  sections,
  highlightClass
}: {
  sections: {
    id: string;
    titleRef: React.RefObject<HTMLButtonElement | null>;
  }[];
  highlightClass: string;
}) {
  // This code will define an anchor point at the center of the viewport.
  // Get each section's bounding rect. If the center of the viewport is inside that rect, that section is active (use the title ref to add a highlighted class)
  // If the page is scrolled all the way to the top, no titles are highlighted.
  useEffect(() => {
    // Get each section element
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    // Create a scroll handler that checks for the active section and highlights its title
    // (throttle the scroll handler so that it only runs every 150ms)
    const throttledHandler = throttle(() => {
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      // Find the section that currently contains the viewport center (top is less than center and bottom is greater than center)
      const activeSection = sectionElements.find((element) => {
        const boundingRect = element?.getBoundingClientRect();
        if (!boundingRect) return false;

        // Get the absolute top and bottom of the section
        const top = boundingRect.top + window.scrollY;
        const bottom = boundingRect.bottom + window.scrollY;

        // Return whether the viewport center is between the top and bottom of the section
        return top <= viewportCenter && bottom >= viewportCenter;
      });

      // Highlight/unhighlight the section titles
      sections.forEach((section) => {
        if (section.id === activeSection?.id) {
          section.titleRef.current?.classList.add(highlightClass);
        } else {
          section.titleRef.current?.classList.remove(highlightClass);
        }
      });
    }, 150);

    window.addEventListener("scroll", throttledHandler);
    return () => {
      window.removeEventListener("scroll", throttledHandler);
      throttledHandler.cancel();
    };
  }, [sections, highlightClass]);
}
