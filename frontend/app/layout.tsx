import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vivek Chowdary — CSE Student & Full-Stack Developer",
  description:
    "Portfolio of Vivek Chowdary, B.Tech CSE student at SRM University AP and full-stack developer. Published IEEE conference paper author. Ask the AI assistant anything about his skills, projects and experience.",
  applicationName: "Vivek Chowdary — Portfolio",
  keywords: [
    "Vivek Chowdary",
    "portfolio",
    "full-stack developer",
    "MERN",
    "React",
    "Node.js",
    "IEEE",
    "SRM University AP",
  ],
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
