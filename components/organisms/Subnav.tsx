import { Button } from "@/components/ui/button";
import _ from "lodash";

interface SubnavProps {
  sectionIds: string[];
  sectionRefs: React.RefObject<HTMLButtonElement | null>[];
}

export default function Subnav({ sectionRefs, sectionIds }: SubnavProps) {
  return (
    <div className="sticky top-16 w-full z-10 left-0 p-4 bg-secondary backdrop-blur-lg">
      <div className="flex flex-row gap-4 items-center justify-center mx-auto max-w-5xl">
        {sectionIds.map((sectionId, index) => (
          <Button
            variant="secondary"
            key={sectionId}
            className="font-display md:text-base md:px-6 "
            ref={sectionRefs[index]}
            onClick={() => {
              // Scroll to the section on click
              const section = document.getElementById(sectionId);
              const rect = section?.getBoundingClientRect();
              if (rect) {
                window.scrollTo({
                  top: rect.top + window.scrollY - 150, // The subnav and topbar take up some height, so we need to scroll slightly below them
                  behavior: "smooth",
                });
              }
            }}
          >
            {_.startCase(sectionId)}
          </Button>
        ))}
      </div>
    </div>
  );
}
