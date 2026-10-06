import "../styles/globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import SiteNavbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body className="bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark antialiased">
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <SiteNavbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}