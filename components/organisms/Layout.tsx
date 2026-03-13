import Footer from "@/components/organisms/footer/Footer";
import Navbar from "@/components/organisms/navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col flex-nowrap bg-background">
      <Navbar />
      <main className="">{children}</main>
      <Footer />
    </div>
  );
}
