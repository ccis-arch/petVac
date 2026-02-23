import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Pet Vaccination System",
  description: "Pet Vaccination System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={"font-Montserrat md:overflow-hidden"}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
