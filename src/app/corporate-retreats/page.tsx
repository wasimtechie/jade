import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { resolveLandingSections } from "@/lib/cms/landingCms";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";

const TEMPLATE_KEY = "landing/corporate-retreats";

export const revalidate = 60;

export default function CorporateRetreatsPage() {
  const sections = resolveLandingSections(TEMPLATE_KEY, null);

  return (
    <main className="relative min-h-screen bg-[#1A1C1E] pb-16 text-white lg:pb-0">
      <Navbar />
      <MobileBottomNav />
      <LandingPageRenderer templateKey={TEMPLATE_KEY} sections={sections} />
      <Footer />
    </main>
  );
}
