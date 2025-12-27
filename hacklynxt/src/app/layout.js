import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Hacklyn - Campus Event Management Platform",
  description: "The ultimate platform for managing campus events, hackathons, and workshops.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
