import type { Metadata } from "next";
import "./globals.css";
import "../components/VisualFactoryStage.css";

export const metadata: Metadata = {
  title: "Studio Atlas",
  description: "Crea Percorsi da vivere in Atlas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
