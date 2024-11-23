import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class"> {/* Enables class-based theming */}
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}