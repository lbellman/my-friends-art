"use client";

import QualityChip from "@/components/atoms/quality-chip/QualityChip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRINT_QUALITY_CHART_ROWS } from "@/lib/print-dimensions";

/**
 * Reference table for how effective print DPI maps to quality labels.
 * Wrapped in an accordion (collapsed by default).
 */
export default function QualityChart() {
  return (
    <Accordion type="single" collapsible className="w-full p-0">
      <AccordionItem value="quality-chart" className="border-none px-0">
        <AccordionTrigger className="hover:no-underline">
          Quality chart
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="rounded-md border border-border">
            <ul className="divide-y divide-border sm:hidden">
              {PRINT_QUALITY_CHART_ROWS.map((row) => (
                <li key={row.tier} className="space-y-2 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <QualityChip tier={row.tier} />
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {row.dpiRange}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {row.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[min(100%,480px)] text-left text-sm">
                <caption className="sr-only">
                  Print quality ratings by effective DPI when the image is printed
                  at a given size
                </caption>
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Quality
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      DPI
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PRINT_QUALITY_CHART_ROWS.map((row) => (
                    <tr key={row.tier}>
                      <td className="px-3 py-2 align-top">
                        <QualityChip tier={row.tier} />
                      </td>
                      <td className="px-3 py-2 align-top text-muted-foreground whitespace-nowrap">
                        {row.dpiRange}
                      </td>
                      <td className="px-3 py-2 text-sm align-top text-muted-foreground">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Effective DPI is pixels divided by print size in inches (width or
            height). Larger prints use the same file at a lower DPI.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
