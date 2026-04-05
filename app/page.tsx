import NavBar from "@/components/NavBar";
import HeroSection from "@/components/home/HeroSection";
import PlatePreviewSection from "@/components/home/PlatePreviewSection";
import FlowSection from "@/components/home/FlowSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import TravelImageSection from "@/components/home/TravelImageSection";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F3F1EC",
        overflowX: "hidden",
      }}
    >
      <NavBar />
      <HeroSection />
      <PlatePreviewSection />
      <FlowSection />
      <TravelImageSection />
      <HowItWorksSection />
    </main>
  );
}