import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: "Meme'd | Campaign payouts, made clear",
  description: 'A polished workspace for creator campaign payouts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Toaster richColors closeButton position="top-right" />{children}</body></html>;
}
