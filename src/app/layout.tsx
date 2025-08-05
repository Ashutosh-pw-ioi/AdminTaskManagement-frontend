import "./globals.css";
import { AuthProvider } from "./contexts/AuthProvider";

export const metadata = {
  title: "My App",
  description: "Student Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
        {children}
        </AuthProvider>

      </body>
    </html>
  );
}
