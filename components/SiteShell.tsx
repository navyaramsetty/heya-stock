"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hiddenPrefixes = [
    "/admin",
    "/dashboard",
    "/upload",
    "/login",
    "/signup",
  ];

  const hideSiteChrome = hiddenPrefixes.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );

  if (hideSiteChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Script id="heya-ads" strategy="lazyOnload" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4320880140894424" crossOrigin="anonymous" />
      <Header />

      <div className="flex-1">
        {children}
      </div>

      <Footer />
    </>
  );
}
