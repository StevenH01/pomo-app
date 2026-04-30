import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pomo — Coffee or F1",
  description: "Stay focused, your way. Cups of coffee or laps around an F1 circuit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
