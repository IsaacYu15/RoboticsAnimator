import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { InputProvider } from "./context/inputContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Robotic Animator",
  description: "An animator for robots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <InputProvider>{children}</InputProvider>
      </body>
    </html>
  );
}
