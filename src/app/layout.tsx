import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { clsx } from "clsx";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Vibrant 2K26",
  description: "Official site and admin dashboard for Zenith Fest."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx(spaceGrotesk.variable, inter.variable)}>
      <body>{children} </body>
    </html>
  );
}
