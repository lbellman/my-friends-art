import Link from "@/components/atoms/Link";
import Subnav from "@/components/organisms/Subnav";
import { ArrowLeftIcon } from "lucide-react";

interface InternalLayoutProps {
  children: React.ReactNode;
  title?: string;
  sectionIds?: string[];
  sectionRefs?: React.RefObject<HTMLButtonElement | null>[];
  back?: {
    href: string;
    label: string;
  } | null;
}

export default function InternalLayout({
  children,
  title,
  sectionIds,
  sectionRefs,
  back = null,
}: InternalLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {sectionIds && sectionRefs && (
        <Subnav sectionIds={sectionIds} sectionRefs={sectionRefs} />
      )}
      <div className={"max-w-5xl flex flex-col w-full items-center px-6 py-12"}>
        {back && (
          <div className="mb-4">
            <Link href={back.href} ariaLabel={back.label}>
              <div className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                {back.label}
              </div>
            </Link>
          </div>
        )}
        {title && <h2 className="font-display text-center text-5xl mb-8">{title}</h2>}
        <main className="flex-1 px-6 w-full py-6 pb-12 ">{children}</main>
      </div>
    </div>
  );
}
