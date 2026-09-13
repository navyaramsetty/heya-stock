import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",

  description: "Manage your Heya contributor account and uploads.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}