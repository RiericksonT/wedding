"use client";

import { useState } from "react";

interface NoticeProps {
  youtubeVideoIds?: string[];
}

const defaultVideoIds = ["qPVqh9mEN-c", "dQw4w9WgXcQ", "3JZ_D3ELwOQ"];

export default function Notice({
  youtubeVideoIds = defaultVideoIds,
}: NoticeProps) {
  const videos = youtubeVideoIds.length > 0 ? youtubeVideoIds : defaultVideoIds;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full bg-[#f3efe9] py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-[#7a9e7e] font-sans mb-2">
            Atenção
          </p>
          <h2 className="text-5xl md:text-7xl text-[#3e503c] mb-4">
            Avisos Importantes
          </h2>
          <div className="w-16 h-px bg-[#3e503c] mx-auto" />
        </div>

        <div className="w-full">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-[#d6d1c4]">
            <iframe
              key={videos[currentIndex]}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videos[currentIndex]}`}
              title={`Avisos do casamento ${currentIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {videos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevVideo}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-[#3e503c] text-white w-14 h-14 rounded-full shadow-[0_8px_24px_rgba(62,80,60,0.35)] border-2 border-white/70 hover:bg-[#2c3a26] transition-all"
                  aria-label="Vídeo anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextVideo}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-[#3e503c] text-white w-14 h-14 rounded-full shadow-[0_8px_24px_rgba(62,80,60,0.35)] border-2 border-white/70 hover:bg-[#2c3a26] transition-all"
                  aria-label="Próximo vídeo"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {videos.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              {videos.map((videoId, idx) => (
                <button
                  key={videoId}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    idx === currentIndex ? "bg-[#3e503c]" : "bg-[#cfc7b8]"
                  }`}
                  aria-label={`Ir para o vídeo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
