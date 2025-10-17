"use client";
import Countdown from "../countdown/countdown";
import Image from "next/image";
import styles from "./home.module.scss";
import { useState } from "react";
import Link from "next/link";

export default function HomeSession() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    const section = document.querySelector(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };
    return (
        <>
        <header className={`items-center justify-between p-6 bg-off-white ${styles.header}`}>
        <nav className={`items-center justify-between p-6 bg-off-white ${styles.navbar}`}>
          <Image
            src="https://github.com/user-attachments/assets/3e32a388-f925-4e82-99d2-036eec6c282b"
            alt="Logo"
            width={120}
            height={50}
          />

          {/* Botão hambúrguer */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <ul className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
            <li>
              <a onClick={() => handleScroll("#about")}>Sobre Nós</a>
            </li>
            <li>
              <a onClick={() => handleScroll("#details")}>Detalhes do Casamento</a>
            </li>
            <li>
              <a onClick={() => handleScroll("#gallery")}>Galeria</a>
            </li>
            <li>
              <Link href="/lista-casamento">Lista de Presentes</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <section className={styles.hero}>
          <Image
            src="https://github.com/user-attachments/assets/72546105-74a6-4496-ac86-9bff89a2277e"
            alt="Casamento"
            width={5000}
            height={2000}
          />

          <div
            className={`absolute bottom-0 w-full h-32 ${styles.cliptriangle}`}
          ></div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Gabriela & Kaique</h1>
            <Countdown />
            <p className={styles.heroSubtitle}>23-09-2026</p>
          </div>
        </section>
      </main>
        </>
    );
}