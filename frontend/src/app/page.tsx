import fs from "node:fs";
import path from "node:path";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutSkills from "@/components/AboutSkills";
import ContactFooter from "@/components/ContactFooter";
import Footer from "@/components/Footer";

const PORTRAIT_FILE = "hero-character.png";

export default function Home() {
  /**
   * Đây là Server Component nên vẫn đọc được filesystem: kiểm tra ảnh nhân vật
   * đã có trong public/ chưa rồi truyền xuống Hero (client component) qua prop.
   */
  const hasPortrait = fs.existsSync(
    path.join(process.cwd(), "public", PORTRAIT_FILE),
  );

  return (
    <>
      <Header />
      <main>
        <Hero hasPortrait={hasPortrait} />
        <AboutSkills />
        <ContactFooter />
      </main>
      <Footer />
    </>
  );
}
