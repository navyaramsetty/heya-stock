"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createVideoPoster } from "@/lib/create-video-poster";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  id: number;
  title: string;
  category: string;
  tags: string | null;
  description: string | null;
  image_url: string | null;
  storage_path: string | null;
  media_type: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
  preview_url?: string | null;
};

export default function ReviewPage() {
  const router = useRouter();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchPendingImages = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("images")
      .select(
        "id, title, category, tags, description, image_url, storage_path, media_type, status, user_id, created_at"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load pending images:", error);
      alert(`Failed to load images: ${error.message}`);
      setLoading(false);
      return;
    }

    const pendingImages: ImageItem[] = data || [];

    const imagesWithPreviews = await Promise.all(
      pendingImages.map(async (image) => {
        // Old uploads that are already inside the public images bucket
        if (image.image_url) {
          return {
            ...image,
            preview_url: image.image_url,
          };
        }

        // New uploads stored privately
        if (image.storage_path) {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("submissions")
              .createSignedUrl(image.storage_path, 3600);

          if (signedError) {
            console.error(
              `Failed to generate preview for image ${image.id}:`,
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
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setCheckingAuth(false);

      await fetchPendingImages();
    };

    initialize();
  }, [router, fetchPendingImages]);



  const approveImage = async (image: ImageItem) => {
    try {
      setUpdatingId(image.id);

      // OLD uploads:
      // already have a public image URL, so we only need to approve them.
      if (image.image_url && !image.storage_path) {
        if (image.media_type === "video") {
          const prefix = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/images/";
          if (!image.image_url.startsWith(prefix)) throw new Error("Re-upload this video to create its preview.");
          const response = await fetch(image.image_url);
          if (!response.ok) throw new Error("Unable to read video.");
          const poster = await createVideoPoster(await response.blob());
          const { error: posterError } = await supabase.storage.from("images")
            .upload(decodeURIComponent(image.image_url.slice(prefix.length)) + ".poster.jpg", poster, { contentType: "image/jpeg", upsert: true });
          if (posterError) throw posterError;
        }
        const { error } = await supabase
          .from("images")
          .update({
            status: "approved",
          })
          .eq("id", image.id);

        if (error) {
          throw error;
        }

        setImages((currentImages) =>
          currentImages.filter((item) => item.id !== image.id)
        );

        alert("Image approved successfully!");
        return;
      }

      // NEW private submissions
      if (!image.storage_path) {
        throw new Error("Private submission file path is missing.");
      }

      const {
        data: { user: adminUser },
        error: adminError,
      } = await supabase.auth.getUser();

      if (adminError || !adminUser) {
        throw new Error("Admin authentication failed.");
      }

      // Download the private file from submissions bucket
      const { data: privateFile, error: downloadError } =
        await supabase.storage
          .from("submissions")
          .download(image.storage_path);

      if (downloadError || !privateFile) {
        throw downloadError || new Error("Unable to read private submission.");
      }

      // Preserve original extension if possible
      const originalFileName =
        image.storage_path.split("/").pop() || "image.jpg";

      const extension =
        originalFileName.split(".").pop()?.toLowerCase() || "jpg";

      // Store approved images under the admin's folder.
      // This works with your current public images storage policy.
      const publicFileName = `approved-${image.id}-${crypto.randomUUID()}.${extension}`;

      const publicFilePath = `${adminUser.id}/${publicFileName}`;

      const { error: publicUploadError } = await supabase.storage
        .from("images")
        .upload(publicFilePath, privateFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: privateFile.type || undefined,
        });

      if (publicUploadError) {
        throw publicUploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("images")
        .getPublicUrl(publicFilePath);

      // Publish only after a real thumbnail is available for video SEO and sharing.
      const publicPaths = [publicFilePath];
      if (image.media_type === "video") {
        try {
          const poster = await createVideoPoster(privateFile);
          const posterPath = publicFilePath + ".poster.jpg";
          const { error: posterError } = await supabase.storage.from("images")
            .upload(posterPath, poster, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
          if (posterError) throw posterError;
          publicPaths.push(posterPath);
        } catch (error) {
          await supabase.storage.from("images").remove(publicPaths);
          throw error;
        }
      }

      // Publish the database record
      const { error: updateError } = await supabase
        .from("images")
        .update({
          image_url: publicUrl,
          status: "approved",
        })
        .eq("id", image.id);

      // If database publishing fails, remove the public copy
      if (updateError) {
        await supabase.storage
          .from("images")
          .remove(publicPaths);

        throw updateError;
      }

      setImages((currentImages) =>
        currentImages.filter((item) => item.id !== image.id)
      );

      alert("Image approved and published successfully!");
    } catch (error: unknown) {
      console.error("Approval failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(`Approval failed: ${message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectImage = async (image: ImageItem) => {
    try {
      setUpdatingId(image.id);

      const { error } = await supabase
        .from("images")
        .update({
          status: "rejected",
        })
        .eq("id", image.id);

      if (error) {
        throw error;
      }

      setImages((currentImages) =>
        currentImages.filter((item) => item.id !== image.id)
      );

      alert("Image rejected.");
    } catch (error: unknown) {
      console.error("Rejection failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(`Rejection failed: ${message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-black">
        <p className="text-lg font-semibold">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link prefetch={false} href="/" className="text-2xl font-bold">
            Heya
          </Link>

          <div className="flex items-center gap-3">
            <Link prefetch={false}
              href="/admin"
              className="rounded-full border px-5 py-2 text-sm font-semibold"
            >
              Upload
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Review Uploads
          </h1>

          <p className="mt-3 text-gray-600">
            Review private contributor submissions before publishing them on
            Heya.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <p className="font-semibold">
              Loading pending images...
            </p>
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold">
              No pending images
            </h2>

            <p className="mt-2 text-gray-500">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="flex h-72 items-center justify-center overflow-hidden bg-gray-200">
                  {image.preview_url ? image.media_type === "video" ? (
                    <video src={image.preview_url} controls preload="metadata" className="h-full w-full object-contain" />
                  ) : (
                    <img
                      src={image.preview_url}
                      alt={image.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <p className="px-6 text-center text-sm text-gray-500">
                      Preview unavailable
                    </p>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                      {image.title}
                    </h2>

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Pending
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-500">
                    {image.category}
                  </p>

                  {image.description && (
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {image.description}
                    </p>
                  )}

                  {image.tags && (
                    <p className="mt-3 text-sm text-gray-500">
                      Tags: {image.tags}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Submitted{" "}
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>

                  {image.storage_path && !image.image_url && (
                    <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
                      🔒 Private submission
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => approveImage(image)}
                      disabled={updatingId === image.id}
                      className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {updatingId === image.id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      onClick={() => rejectImage(image)}
                      disabled={updatingId === image.id}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === image.id
                        ? "Processing..."
                        : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
