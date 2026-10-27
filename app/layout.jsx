import "./globals.css";

export const metadata = {
  title: "AI Style Studio — Ubah Foto dengan AI",
  description: "Ubah foto menjadi berbagai gaya AI dengan AI Style Studio.",
  metadataBase: new URL("https://ai.linkdrop.my.id"),
  openGraph: {
    title: "AI Style Studio",
    description: "Jelajahi berbagai gaya foto AI.",
    type: "website"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080b14"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
