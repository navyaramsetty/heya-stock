"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  image_url: string | null;
  storage_path: string | null;
  media_type: string | null;
  status: string;
  downloads: number;
  created_at: string;
  preview_url?: string | null;
};

export default function AdminMediaPage() {
  const router = useRouter();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      if (session.user.email !== "navyaramsetty@gmail.com") {
        router.replace("/");
        return;
      }

      await loadMedia();
    };

    initialize();
  }, [router]);

  const loadMedia = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("images")
      .select(
        "id, title, category, image_url, storage_path, media_type, status, downloads, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Unable to load media: ${error.message}`);
      setLoading(false);
      return;
    }

    const mediaItems: MediaItem[] = data || [];

    const itemsWithPreviews = await Promise.all(
      mediaItems.map(async (item) => {
        if (item.image_url) {
          return {
            ...item,
            preview_url: item.image_url,
          };
        }

        if (item.storage_path) {
          const { data: signedData } = await supabase.storage
            .from("submissions")
            .createSignedUrl(item.storage_path, 3600);

          return {
            ...item,
            preview_url: signedData?.signedUrl || null,
          };
        }

        return {
          ...item,
          preview_url: null,
        };
      })
    );

    setItems(itemsWithPreviews);
    setLoading(false);
  };

  const getPublicStoragePath = (publicUrl: string | null) => {
    if (!publicUrl) return null;

    const marker = "/storage/v1/object/public/images/";

    const markerIndex = publicUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const path = publicUrl.substring(
      markerIndex + marker.length
    );

    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  };

  const deleteMedia = async (item: MediaItem) => {
    const confirmed = window.confirm(
      `Delete "${item.title}" permanently?\n\nThis will remove the database record and associated storage files. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      // 1. Remove published public file if present
      const publicStoragePath = getPublicStoragePath(
        item.image_url
      );

      if (publicStoragePath) {
        const { error: publicDeleteError } =
          await supabase.storage
            .from("images")
            .remove([publicStoragePath]);

        if (publicDeleteError) {
          throw new Error(
            `Unable to delete public file: ${publicDeleteError.message}`
          );
        }
      }

      // 2. Remove original private submission if present
      if (item.storage_path) {
        const { error: privateDeleteError } =
          await supabase.storage
            .from("submissions")
            .remove([item.storage_path]);

        if (privateDeleteError) {
          throw new Error(
            `Unable to delete private submission: ${privateDeleteError.message}`
          );
        }
      }

      // 3. Delete database record
      const { error: databaseDeleteError } = await supabase
        .from("images")
        .delete()
        .eq("id", item.id);

      if (databaseDeleteError) {
        throw new Error(
          `Unable to delete database record: ${databaseDeleteError.message}`
        );
      }

      setItems((current) =>
        current.filter((media) => media.id !== item.id)
      );

      alert("Media deleted successfully.");
    } catch (error: unknown) {
      console.error("Delete failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      alert(`Delete failed: ${message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-2xl font-black">
            Heya
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/admin/review"
              className="rounded-full border px-4 py-2 text-sm font-semibold"
            >
              Review
            </a>

            <a
              href="/admin"
              className="rounded-full border px-4 py-2 text-sm font-semibold"
            >
              Upload
            </a>

            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Media Manager
          </h1>

          <p className="mt-3 text-gray-600">
            Manage and permanently delete images and videos from Heya.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center">
            <p className="font-semibold">
              Loading media...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center">
            <h2 className="text-2xl font-bold">
              No media found
            </h2>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const isVideo =
                item.media_type === "video";

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="flex h-64 items-center justify-center overflow-hidden bg-black">
                    {item.preview_url ? (
                      isVideo ? (
                        <video
                          src={item.preview_url}
                          controls
                          preload="metadata"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <img
                          src={item.preview_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <p className="text-sm text-gray-400">
                        Preview unavailable
                      </p>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-bold">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.category}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {isVideo ? "Video" : "Image"}
                      </span>

                      <span>
                        {item.downloads || 0} downloads
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Uploaded{" "}
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => deleteMedia(item)}
                      disabled={deletingId === item.id}
                      className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      {deletingId === item.id
                        ? "Deleting..."
                        : "Delete Permanently"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}