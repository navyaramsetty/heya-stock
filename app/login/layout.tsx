import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",

  description: "Login to your Heya account.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}