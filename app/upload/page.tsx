"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const categories = [
    "Business",
    "Nature",
    "Technology",
    "Travel",
    "Food",
    "Healthcare",
    "Education",
    "Backgrounds",
  ];

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please select an image or video file.");
      event.target.value = "";
      return;
    }

    // Images: maximum 10 MB
    if (isImage && selectedFile.size > 10 * 1024 * 1024) {
      alert("Images must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    // Videos: maximum 25 MB
    if (isVideo && selectedFile.size > 25 * 1024 * 1024) {
      alert("Videos must be 25 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(newPreviewUrl);
    setMediaType(isVideo ? "video" : "image");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!file) {
      alert("Please choose an image or video.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to upload.");
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        (mediaType === "video" ? "mp4" : "jpg");

      const cleanTitle = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const safeFileName = `${
        cleanTitle || mediaType
      }-${Date.now()}.${extension}`;

      const storagePath = `${user.id}/${safeFileName}`;

      // Upload privately first
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Insert pending database record
      const { error: databaseError } = await supabase
        .from("images")
        .insert({
          title: title.trim(),
          category,
          tags: tags.trim() || null,
          description: description.trim() || null,
          image_url: null,
          storage_path: storagePath,
          media_type: mediaType,
          downloads: 0,
          featured: false,
          user_id: user.id,
          status: "pending",
        });

      if (databaseError) {
        throw databaseError;
      }

      alert(
        mediaType === "video"
          ? "Video uploaded successfully! It is waiting for admin approval."
          : "Image uploaded successfully! It is waiting for admin approval."
      );

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      console.error("Upload failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(`Upload failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
        <p className="text-lg font-semibold">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link prefetch={false} href="/" className="text-2xl font-bold">
            Heya
          </Link>

          <div className="flex items-center gap-4">
            <Link prefetch={false}
              href="/dashboard"
              className="text-sm font-semibold text-gray-600"
            >
              Dashboard
            </Link>

            <Link prefetch={false}
              href="/"
              className="rounded-full border px-5 py-2 text-sm font-semibold"
            >
              Explore
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Contributor Upload
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Upload to Heya
          </h1>

          <p className="mt-3 text-gray-600">
            Submit your photos or videos for review.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Photo or Video
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-black">
              <span className="text-3xl">
                {mediaType === "video" ? "🎬" : "📷"}
              </span>

              <span className="mt-3 font-bold">
                Choose an image or video
              </span>

              <span className="mt-2 text-sm text-gray-500">
                Images up to 10 MB • Videos up to 25 MB
              </span>

              <span className="mt-1 text-xs text-gray-400">
                JPG, PNG, WEBP, MP4 or WEBM
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {previewUrl && file && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-black">
              {mediaType === "video" ? (
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-[500px] w-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-[500px] w-full object-contain"
                />
              )}

              <div className="bg-gray-900 px-4 py-3 text-sm text-white">
                <p className="truncate font-semibold">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {mediaType === "video" ? "Video" : "Image"} •{" "}
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <label className="mb-2 block text-sm font-semibold">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Sunset over the mountains"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Category
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
            >
              <option value="">
                Select category
              </option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Tags
            </label>

            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="nature, sunset, mountains, travel"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-2 text-xs text-gray-400">
              Separate keywords with commas.
            </p>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe your photo or video..."
              rows={5}
              className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mt-8 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-black">
              Before uploading
            </p>

            <p className="mt-2 leading-6">
              Upload only content you created or have permission to
              distribute. Every submission is reviewed before it becomes
              publicly available on Heya.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Uploading..."
              : mediaType === "video"
              ? "Submit Video for Review"
              : "Submit Image for Review"}
          </button>
        </form>
      </section>
    </main>
  );
}
