import styles from "./our.module.scss";
import Image from "next/image";

export default function OurHistory() {
    return (
        <div className={styles.main} id="about">
            <div className={styles.imageWrapper}>
                <Image
                    src="https://github.com/user-attachments/assets/fc07f87e-765e-408d-8fe5-fdf672ba121a"
                    alt="Imagem 1"
                    width={500}
                    height={500}
                    className={styles.imageBase}
                />
                <Image
                    src="https://github.com/user-attachments/assets/be01d0bb-9007-4433-989e-0b5485a825da"
                    alt="Imagem 2"
                    width={500}
                    height={500}
                    className={styles.imageOverlay}
                />
            </div>
            
            <div className={styles.text}>
                <h2>Nossa História</h2>
                <p>
                    Tudo começou de um jeito simples, mas marcante. No primeiro olhar, Kaique teve certeza: foi paixão à primeira vista. Ele a viu cantando pela primeira vez e se encantou mesmo em um dia em que a emoção falou mais alto e a voz não saiu exatamente como planejado. Ainda assim, algo ali já dizia que aquela história seria especial.
Depois desse encontro, ele tomou a iniciativa e a procurou no Instagram. As conversas começaram, os gestos de carinho também: presentes, cartinhas e cuidado. Mas, curiosamente, o tempo passou. Foram quase dois anos de proximidade, sem que nada oficialmente acontecesse.
Em determinado momento, Kaique decidiu parar, seguir seu caminho e deixar aquela história para trás. Foi então que, em silêncio, Gabriela refletiu porque, em seu coração, Deus sempre confirmava que Kaique era o amor da sua vida.
No final de 2023, os caminhos se reencontraram. As conversas voltaram, agora com mais clareza e propósito. Em fevereiro, veio o convite para o primeiro encontro e, no dia 14 de fevereiro, o amor ganhou nome: eles começaram a namorar.
Em março de 2025, Kaique fez o pedido de noivado. Hoje, estão noivos, certos de que cada pausa, cada espera e cada reencontro fizeram parte de um plano maior. Uma história escrita com tempo, fé e a certeza de que aquilo que Deus une floresce no momento certo.
                </p>
            </div>
            <div className={styles.imageWrapper2}>
                <Image
                    src="https://github.com/user-attachments/assets/0efac15f-21c3-46ad-ab5a-8364b8b0e20f"
                    alt="Imagem 2"
                    width={500}
                    height={500}
                    className={styles.imageBase}
                />
                <Image
                    src="https://github.com/user-attachments/assets/88d092d5-bf41-46fe-8493-4fc49c7cc7a0"
                    alt="Imagem 2"
                    width={500}
                    height={500}
                    className={styles.imageOverlay}
                />
            </div>
        </div>
    )
}