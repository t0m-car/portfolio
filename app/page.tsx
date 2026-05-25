import { Beliefs } from "@/components/Beliefs";
import { Foot } from "@/components/Foot";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Playground } from "@/components/Playground";
import { StructuredData } from "@/components/StructuredData";
import { StudioNodeo } from "@/components/StudioNodeo";
import { Work } from "@/components/Work";
import { Reveal } from "@/components/motion/Reveal";
import { content } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <Nav dict={content.nav} />
      <main className="stage">
        <Hero dict={content.hero} />

        <div id="work">
          <Work dict={content.work} />
        </div>
        <div id="studio">
          <StudioNodeo dict={content.studio} />
        </div>
        <div id="playground">
          <Playground dict={content.playground} />
        </div>
        <div id="beliefs">
          <Beliefs dict={content.notes} />
        </div>

        <Reveal>
          <Foot dict={content.footer} />
        </Reveal>
      </main>
    </>
  );
}
