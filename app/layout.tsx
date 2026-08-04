import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const repository = "Instituto-Horizonte-Final";
const publicUrl = `https://leoncenteno2009-sudo.github.io/${repository}/`;

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: "Instituto Horizonte — Aprende, crea y avanza",
  description: "Una experiencia educativa donde las ideas cobran vida, la comunidad impulsa y cada estudiante encuentra su propia forma de avanzar.",
  keywords: ["Instituto Horizonte", "escuela", "bachillerato", "educación", "aprendizaje por proyectos", "vida estudiantil"],
  alternates: { canonical: publicUrl },
  icons: {
    icon: [
      { url: `/${repository}/favicon.png`, type: "image/png" },
      { url: "/favicon.png", type: "image/png" }
    ],
    shortcut: `/${repository}/favicon.png`,
    apple: `/${repository}/favicon.png`
  },
  openGraph: {
    title: "Instituto Horizonte — Aprende, crea y avanza",
    description: "Tu curiosidad tiene un lugar para crecer.",
    url: publicUrl,
    siteName: "Instituto Horizonte",
    locale: "es_MX",
    type: "website",
    images: [{ url: `/${repository}/og.png`, width: 1792, height: 1024, alt: "Instituto Horizonte — Tu curiosidad tiene un lugar para crecer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instituto Horizonte — Aprende, crea y avanza",
    description: "Tu curiosidad tiene un lugar para crecer.",
    images: [`/${repository}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="icon" type="image/png" href={`/${repository}/favicon.png`} />
        <link rel="shortcut icon" href={`/${repository}/favicon.png`} />
        <link rel="apple-touch-icon" href={`/${repository}/favicon.png`} />
      </head>
      <body className={geist.variable}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Instituto Horizonte",
              url: publicUrl,
              description: "Institución educativa enfocada en aprendizaje activo, creatividad, comunidad y desarrollo personal.",
            }),
          }}
        />
      </body>
    </html>
  );
}
