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

export default function DashboardPage() {
  const router = useRouter();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email || "");

      const name =
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "User";

      setUserName(name);

      const { data, error } = await supabase
        .from("images")
        .select(
          "id, title, category, image_url, storage_path, media_type, status, downloads, created_at"
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load uploads:", error);
        setItems([]);
        setLoading(false);
        return;
      }

      const uploads: MediaItem[] = data || [];

      const uploadsWithPreviews = await Promise.all(
        uploads.map(async (item) => {
          if (item.image_url) {
            return {
              ...item,
              preview_url: item.image_url,
            };
          }

          if (item.storage_path) {
            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("submissions")
                .createSignedUrl(item.storage_path, 3600);

            if (signedError) {
              console.error(
                `Failed to generate preview for ${item.id}:`,
                signedError
              );

              return {
                ...item,
                preview_url: null,
              };
            }

            return {
              ...item,
              preview_url: signedData.signedUrl,
            };
          }

          return {
            ...item,
            preview_url: null,
          };
        })
      );

      setItems(uploadsWithPreviews);
      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getStatusStyle = (status: string) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const approvedCount = items.filter(
    (item) => item.status === "approved"
  ).length;

  const pendingCount = items.filter(
    (item) => item.status === "pending"
  ).length;

  const videoCount = items.filter(
    (item) => item.media_type === "video"
  ).length;

  const totalDownloads = items.reduce(
    (total, item) => total + (item.downloads || 0),
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
        <p className="text-lg font-semibold">
          Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-2xl font-bold">
            Heya
          </a>

          <div className="flex items-center gap-4">
            <a
              href="/"
              className="hidden text-sm font-semibold text-gray-600 sm:block"
            >
              Explore
            </a>

            <a
              href="/upload"
              className="hidden text-sm font-semibold text-gray-600 sm:block"
            >
              Upload
            </a>

            <button
              onClick={handleLogout}
              className="rounded-full border px-5 py-2 text-sm font-semibold transition hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Contributor Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {userName}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {userEmail}
            </p>
          </div>

          <a
            href="/upload"
            className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            + Upload Media
          </a>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Uploads
            </p>

            <p className="mt-2 text-3xl font-bold">
              {items.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Videos
            </p>

            <p className="mt-2 text-3xl font-bold">
              {videoCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Downloads
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalDownloads}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              My Uploads
            </h2>

            <p className="text-sm text-gray-500">
              {items.length}{" "}
              {items.length === 1 ? "submission" : "submissions"}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="text-xl font-bold">
                No uploads yet
              </h3>

              <p className="mt-2 text-gray-500">
                Upload your first image or video to Heya.
              </p>

              <a
                href="/upload"
                className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
              >
                Upload Media
              </a>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const isVideo =
                  item.media_type === "video";

                return (
                  <div
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
                        <div className="px-6 text-center text-sm text-gray-400">
                          Preview unavailable
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.category}
                          </p>

                          <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                            {isVideo ? "Video" : "Image"}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {item.status === "pending" && (
                        <div className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                          Your submission is waiting for admin review.
                        </div>
                      )}

                      {item.status === "rejected" && (
                        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                          This submission was not approved.
                        </div>
                      )}

                      <div className="mt-5 border-t pt-4">
                        <p className="text-sm text-gray-500">
                          Downloads: {item.downloads || 0}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Uploaded{" "}
                          {new Date(
                            item.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {item.status === "approved" &&
                        item.image_url && (
                          <a
                            href={`/image/${item.id}`}
                            className="mt-4 inline-block text-sm font-semibold underline"
                          >
                            View published{" "}
                            {isVideo ? "video" : "image"}
                          </a>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}