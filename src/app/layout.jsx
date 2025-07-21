import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "PostCraft AI",
  description: "Turn your ideas into stunning social media posts in seconds.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased backdrop-blur-3xl" style={{backgroundColor: '#444444', backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(30, 58, 138, 0.2) 0%, transparent 50%)'}}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
