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
                    Nossa história começou em um dia ensolarado de verão, quando
                    nossos caminhos se cruzaram pela primeira vez. Desde então,
                    cada momento juntos tem sido uma aventura incrível, cheia de
                    risos, aprendizados e muito amor. Estamos ansiosos para
                    compartilhar esse dia especial com todos vocês, celebrando o
                    amor que nos une e o futuro que estamos construindo juntos. 
                    Nossa história começou em um dia ensolarado de verão, quando
                    nossos caminhos se cruzaram pela primeira vez. Desde então,
                    cada momento juntos tem sido uma aventura incrível, cheia de
                    risos, aprendizados e muito amor. Estamos ansiosos para
                    compartilhar esse dia especial com todos vocês, celebrando o
                    amor que nos une e o futuro que estamos construindo juntos.
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