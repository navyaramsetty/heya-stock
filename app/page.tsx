import { createClient } from "@supabase/supabase-js";
import HomeClient from "@/components/HomeClient";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  tags: string | null;
  description: string | null;
  image_url: string | null;
  media_type: string | null;
  downloads: number;
  featured: boolean | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data, error } = await supabase
    .from("images")
    .select(
      "id, title, category, tags, description, image_url, media_type, downloads, featured, created_at"
    )
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Failed to load approved media:",
      error
    );
  }

  const items: MediaItem[] = data || [];

  return (
    <HomeClient initialItems={items} />
  );
}