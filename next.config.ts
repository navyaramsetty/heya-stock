import type { NextConfig } from "next";
const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
const nextConfig: NextConfig = {
  images: { remotePatterns: storage ? [new URL(storage + "/storage/v1/object/public/**")] : [] },
};
export default nextConfig;
