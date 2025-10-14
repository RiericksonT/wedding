export default function Where() {
  return (
    <section id="details" className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f9f6f2] px-6 md:px-12 py-16">
      {/* Título */}
      <h2 className="text-4xl md:text-6xl lg:text-7xl italic text-[#3e503c] mb-10 text-center">
        Quando e Onde?
      </h2>

      {/* Conteúdo principal */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-12 w-full max-w-6xl">
        
        {/* Mapa responsivo */}
        <div className="flex-1 w-full">
          <div className="relative w-full pb-[75%] md:pb-[60%] lg:pb-[56%]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d921.4520164269595!2d-36.41669994131273!3d-8.325761087704963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7a9c78a6c7f9197%3A0x1c0fef814f359ff3!2zUGFsYXp6byBSZWNlcMOnw7Vlcw!5e0!3m2!1spt-BR!2sbr!4v1758635340770!5m2!1spt-BR!2sbr"
              className="absolute top-0 left-0 w-full h-full rounded-lg border-4 border-[#3e503c]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Texto lateral */}
        <div className="flex-1 text-[#3e503c] italic leading-relaxed text-base md:text-lg font-serif text-center md:text-left">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            condimentum quam vel felis pretium, vitae feugiat neque facilisis.
            Integer mattis elit at magna cursus, nec imperdiet massa interdum.
          </p>
          <p className="mt-4">
            Donec sagittis, risus eu bibendum gravida, neque justo malesuada
            elit, vel porta lectus ligula nec nunc. Proin vitae urna ac libero
            aliquam sagittis.
          </p>

          {/* Linha inferior com ícones */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-12 mt-10 text-[#3e503c]">
            {/* Horário */}
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 md:w-20 md:h-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
              </svg>
              <span className="text-lg md:text-xl font-bold mt-2">19:00 h</span>
            </div>

            {/* Data */}
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 md:w-20 md:h-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                />
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" />
              </svg>
              <span className="text-lg md:text-xl font-bold mt-2">
                23/09/2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
