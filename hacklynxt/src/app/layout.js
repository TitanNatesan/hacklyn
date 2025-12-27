import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: {
    default: "Hacklyn - Campus Event Management Platform",
    template: "%s | Hacklyn",
  },
  description: "The ultimate platform for managing campus events, hackathons, and workshops. Connect with fellow hackers, join teams, and build amazing projects.",
  keywords: ["hackathon", "campus events", "workshops", "tech events", "student hackathon", "coding competition", "team building", "project showcase"],
  authors: [{ name: "Hacklyn Team" }],
  creator: "Hacklyn",
  publisher: "Hacklyn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hacklyn - Campus Event Management Platform",
    description: "The ultimate platform for managing campus events, hackathons, and workshops.",
    url: "/",
    siteName: "Hacklyn",
    images: [
      {
        url: "/hacklyn.png",
        width: 512,
        height: 512,
        alt: "Hacklyn Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hacklyn - Campus Event Management Platform",
    description: "The ultimate platform for managing campus events, hackathons, and workshops.",
    images: ["/hacklyn.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/hacklyn.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
