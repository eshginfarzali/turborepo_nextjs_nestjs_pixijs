import './globals.css';
import Providers from '../components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
