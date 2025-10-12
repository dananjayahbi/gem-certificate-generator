import "../styles/globals.css";
import NavigationLayout from "../components/layout/NavigationLayout";
import { ToastProvider } from "../hooks/useToast";

export const metadata = {
  title: "Certificate Generator",
  description: "Digital Certificate Generator and Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <NavigationLayout>
            {children}
          </NavigationLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
