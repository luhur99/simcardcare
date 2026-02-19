import { useEffect } from "react";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const PUBLIC_PATHS = ["/login"];

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !PUBLIC_PATHS.includes(router.pathname)) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show nothing while checking session to avoid flash of protected content
  if (loading) return null;

  // Allow public pages to render without auth
  if (!user && PUBLIC_PATHS.includes(router.pathname)) return <>{children}</>;

  // Block protected pages until user is confirmed
  if (!user) return null;

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
