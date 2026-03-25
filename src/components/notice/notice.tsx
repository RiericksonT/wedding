"use client";

interface NoticeProps {
  youtubeVideoId?: string;
}

export default function Notice({ youtubeVideoId = "dQw4w9WgXcQ" }: NoticeProps) {
  return (
    <section className="w-full bg-[#f3efe9] py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
        {/* Cabeçalho */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-[#7a9e7e] font-sans mb-2">
            Atenção
          </p>
          <h2 className="text-4xl md:text-5xl  text-[#3e503c] mb-4">
            Avisos Importantes
          </h2>
          <div className="w-16 h-px bg-[#3e503c] mx-auto" />
        </div>

        {/* Vídeo do YouTube */}
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-[#d6d1c4]">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            title="Avisos do casamento"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
