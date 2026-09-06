"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  id: number;
  title: string;
  category: string;
  image_url: string | null;
  storage_path: string | null;
  status: string;
  downloads: number;
  created_at: string;
  preview_url?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [images, setImages] = useState<ImageItem[]>([]);
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
          "id, title, category, image_url, storage_path, status, downloads, created_at"
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load user images:", error);
        setImages([]);
        setLoading(false);
        return;
      }

      const userImages: ImageItem[] = data || [];

      const imagesWithPreviews = await Promise.all(
        userImages.map(async (image) => {
          // Approved images already have a public URL
          if (image.image_url) {
            return {
              ...image,
              preview_url: image.image_url,
            };
          }

          // Pending/rejected submissions are private
          if (image.storage_path) {
            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("submissions")
                .createSignedUrl(image.storage_path, 3600);

            if (signedError) {
              console.error(
                `Failed to create preview for image ${image.id}:`,
                signedError
              );

              return {
                ...image,
                preview_url: null,
              };
            }

            return {
              ...image,
              preview_url: signedData.signedUrl,
            };
          }

          return {
            ...image,
            preview_url: null,
          };
        })
      );

      setImages(imagesWithPreviews);
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

  const approvedCount = images.filter(
    (image) => image.status === "approved"
  ).length;

  const pendingCount = images.filter(
    (image) => image.status === "pending"
  ).length;

  const totalDownloads = images.reduce(
    (total, image) => total + (image.downloads || 0),
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
      {/* Header */}
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
        {/* Welcome */}
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
            + Upload Image
          </a>
        </div>

        {/* Statistics */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Uploads
            </p>

            <p className="mt-2 text-3xl font-bold">
              {images.length}
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
              Pending Review
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Downloads
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalDownloads}
            </p>
          </div>
        </div>

        {/* Uploads */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              My Uploads
            </h2>

            <p className="text-sm text-gray-500">
              {images.length}{" "}
              {images.length === 1 ? "submission" : "submissions"}
            </p>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="text-xl font-bold">
                No uploads yet
              </h3>

              <p className="mt-2 text-gray-500">
                Upload your first image to Heya.
              </p>

              <a
                href="/upload"
                className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
              >
                Upload Image
              </a>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  {/* Image Preview */}
                  <div className="flex h-64 items-center justify-center overflow-hidden bg-gray-200">
                    {image.preview_url ? (
                      <img
                        src={image.preview_url}
                        alt={image.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="px-6 text-center text-sm text-gray-500">
                        Preview unavailable
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold">
                          {image.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {image.category}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          image.status
                        )}`}
                      >
                        {image.status}
                      </span>
                    </div>

                    {/* Pending message */}
                    {image.status === "pending" && (
                      <div className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                        Your image is waiting for admin review.
                      </div>
                    )}

                    {/* Rejected message */}
                    {image.status === "rejected" && (
                      <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        This submission was not approved.
                      </div>
                    )}

                    <div className="mt-5 border-t pt-4">
                      <p className="text-sm text-gray-500">
                        Downloads: {image.downloads || 0}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Uploaded{" "}
                        {new Date(
                          image.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {image.status === "approved" &&
                      image.image_url && (
                        <a
                          href={`/image/${image.id}`}
                          className="mt-4 inline-block text-sm font-semibold underline"
                        >
                          View published image
                        </a>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}