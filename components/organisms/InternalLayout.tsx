import Subnav from "@/components/organisms/Subnav";

interface InternalLayoutProps {
  children: React.ReactNode;
  title?: string;
  sectionIds?: string[];
  sectionRefs?: React.RefObject<HTMLButtonElement | null>[];
}

export default function InternalLayout({
  children,
  title,
  sectionIds,
  sectionRefs,
}: InternalLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {sectionIds && sectionRefs && (
        <Subnav sectionIds={sectionIds} sectionRefs={sectionRefs} />
      )}
      <div className={"max-w-5xl flex flex-col w-full items-center px-6 py-12"}>
        {title && <h2 className="font-display text-5xl mb-12">{title}</h2>}
        <main className="flex-1 px-6 w-full py-6 md:py-12">{children}</main>
      </div>
    </div>
  );
}
