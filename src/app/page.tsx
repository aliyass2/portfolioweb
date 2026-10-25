import { About } from "@/components/About";
import { Approach } from "@/components/Approach";
import { CapabilityStrip } from "@/components/CapabilityStrip";
import { ConsoleProvider } from "@/components/ConsoleProvider";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Bus } from "@/components/living/Bus";
import { PointerFx } from "@/components/living/PointerFx";
import { Nav } from "@/components/Nav";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <ConsoleProvider>
      <Nav />
      <main className="flex-1">
        <Hero />
        {/* everything below the hero hangs off the message bus */}
        <div className="relative">
          <Bus />
          <CapabilityStrip />
          <Work />
          <Approach />
          <About />
          <Contact />
        </div>
      </main>
      <PointerFx />
    </ConsoleProvider>
  );
}
