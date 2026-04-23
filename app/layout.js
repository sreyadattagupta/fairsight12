import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

export const metadata = {
  title: "FairSight — AI Bias Detection Platform",
  description:
    "Inspect datasets and AI models for hidden bias. Measure, flag, and fix discrimination before it impacts real people.",
  keywords: ["AI fairness", "bias detection", "machine learning", "ethics"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
