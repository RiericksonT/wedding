"use client";
import { useState, useEffect } from "react";
import Presentes from '../../app/presentes/page';

const images = [
  "https://github.com/user-attachments/assets/41189c99-7998-451c-81fb-128ec9336eb7",
  "https://github.com/user-attachments/assets/1d3b34cf-c183-4f90-836d-2f7611b00a5a",
  "https://github.com/user-attachments/assets/2c7f62ca-2efb-4c87-ba92-d3d567635eeb",
  "https://github.com/user-attachments/assets/2d23cdd9-0b2c-42e6-9947-fc88cdd80c22",
  "https://github.com/user-attachments/assets/f9ccad2d-2577-42a0-af09-c0bc5a185009",
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Pré-carrega todas as imagens
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="gallery" className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f9f6f2] px-8 py-16">
      <h2 className="text-5xl md:text-7xl italic text-[#3e503c] mb-12">
        Galeria
      </h2>

      <div className="relative w-full max-w-6xl">
        <img
          src={images[currentIndex]}
          alt={`Imagem ${currentIndex + 1}`}
          className="w-full h-[500px] object-cover rounded-lg shadow-lg transition-opacity duration-300"
        />

        {/* Botões de navegação */}
        <button
          onClick={prevImage}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#3e503c] text-white p-3 rounded-r-lg hover:bg-[#2c3a26]"
        >
          ‹
        </button>
        <button
          onClick={nextImage}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#3e503c] text-white p-3 rounded-l-lg hover:bg-[#2c3a26]"
        >
          ›
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx === currentIndex ? "bg-[#3e503c]" : "bg-[#ccc]"
              }`}
            ></span>
          ))}
        </div>
      </div>
      <div>
        <button onClick={() => window.location.href = '/lista-casamento'} className="mt-14 px-8 py-6 bg-[#3e503c] text-white rounded-lg hover:bg-[#2c3a26] text-2xl md:text-3xl italic">
          Lista de Presentes
        </button>
      </div>
    </section>
  );
}