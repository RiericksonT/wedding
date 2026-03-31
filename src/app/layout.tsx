import type { Metadata } from "next";
import "../styles/globals.scss";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "Gabriela & Kaique",
  description: "Site do casamento de Gabriela e Kaique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased"
        style={{
          fontFamily:
            '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {children}
        <ToastContainer 
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </body>
    </html>
  );
}
