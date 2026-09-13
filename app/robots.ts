import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard",
        "/upload",
        "/login",
        "/signup",
      ],
    },

    sitemap: "https://heya-stock.vercel.app/sitemap.xml",
    host: "https://heya-stock.vercel.app",
  };
}