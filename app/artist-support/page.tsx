import InternalLayout from "@/components/organisms/InternalLayout";
import { PrintDimensionsCalculator } from "@/components/organisms/print-dimensions-calculator/PrintDimensionsCalculator";

export default function ArtistSupportPage() {
  return (
    <InternalLayout title="Artist Support">
      <div className="flex flex-col gap-12 flex-nowrap">
        {/* Overview */}
        <div className="flex flex-col gap-4" id="uploading-your-art">
          <h2 className="font-display">Digitizing your Art</h2>
          <p>
            In order to ensure the best quality prints, it is important that the
            files you share are high-quality. The better the pixel resolution,
            the more dimensions the print will be available in. For physical art
            (acrylic, watercolor, pastel, etc., anything that is not digital),
            it&apos;s recommended that you scan it rather than taking a photo.
            On iPhones, you can use the "Scan Document" feature to get a
            high-quality scan (MUCH better than just a photo). Side note for
            iPhone users: The Preview app has the ability to export the scanned
            document with options, here they allow you to set your own DPI. I
            recommend going with 300 DPI and exporting as a jpeg. For Android
            phones, the Google Drive app has a "Scan" feature that is also very
            good.
          </p>
        </div>

        {/* Print dimensions calculator */}
        <div className="flex flex-col gap-4" id="print-dimensions-calculator">
          <PrintDimensionsCalculator />
        </div>
        <div className="flex flex-col gap-4" id="pricing-and-shipping">
          <h2 className="font-display">Pricing & Shipping</h2>
          <p>
            You as an artist have the freedom to set your own pricing for your
            time, materials, and skills, but I recommend using the following
            formula:
          </p>
          <ol>
            <li>
              <p>
                <span className="font-semibold">
                  1. Start with the printing and shipping cost.
                </span>
              </p>
              <p>
                Most print shops offer a print + shipping bundle, you just give
                them the customer&apos;s address. This way you don&apos;t have
                to worry about packaging or order tracking. The print shop will
                give you a quote for the dimensions, print type, quantity, and
                shipping cost. This is your{" "}
                <span className="font-semibold">base cost.</span>
              </p>
            </li>
            <li className="mt-4">
              <p>
                <span className="font-semibold">
                  2. Add your artist margin.
                </span>
              </p>
              <p>
                A simply rule many artists use is to charge about{" "}
                <span className="font-semibold">2-3x the base cost. </span>
                Again, you can decide this at your own discretion. Ensure that
                the customer agrees to this price before you place the order at
                the print shop.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </InternalLayout>
  );
}
