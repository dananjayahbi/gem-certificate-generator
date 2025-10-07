import "../styles/globals.css";
import NavigationLayout from "../components/layout/NavigationLayout";
import { ToastProvider } from "../hooks/useToast";
import AuthProtectionWrapper from "../components/wrappers/auth/AuthProtectionWrapper";

export const metadata = {
  title: "Certificate Generator",
  description: "Digital Certificate Generator and Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <AuthProtectionWrapper>
            <NavigationLayout>
              {children}
            </NavigationLayout>
          </AuthProtectionWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
