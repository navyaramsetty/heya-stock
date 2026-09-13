import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Media",

  description: "Upload stock photos and videos to your Heya contributor account.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}