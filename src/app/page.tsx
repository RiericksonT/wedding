import ImageCarousel from "@/components/carrouseel/carrossel";
import HomeSession from "@/components/home/home";
import OurHistory from "@/components/our/our";
import Where from "@/components/where/where";

export default function Home() {
  return (
    <>
      <HomeSession />
      <OurHistory />
      <Where />
      <ImageCarousel />
    </>
  );
}
