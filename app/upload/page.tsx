"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        router.push("/login");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    if (!imageFile) {
      setErrorMessage("Please select an image.");
      return;
    }

    if (!category) {
      setErrorMessage("Please select a category.");
      return;
    }

    try {
      setUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to upload.");
      }

      const originalExtension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${originalExtension}`;

      // Each contributor gets their own private folder
      const filePath = `${user.id}/${safeFileName}`;

      // Upload to PRIVATE submissions bucket
      const { error: storageError } = await supabase.storage
        .from("submissions")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (storageError) {
        throw storageError;
      }

      // Store only the private path in the database.
      // No public URL is created while the image is pending.
      const { error: databaseError } = await supabase
        .from("images")
        .insert({
          title: title.trim(),
          category,
          tags: tags.trim(),
          description: description.trim(),
          image_url: null,
          storage_path: filePath,
          downloads: 0,
          featured: false,
          user_id: user.id,
          status: "pending",
        });

      if (databaseError) {
        console.error(
          "Image uploaded to storage but database insert failed:",
          databaseError
        );

        throw databaseError;
      }

      alert(
        "Image uploaded successfully! It has been sent for admin review."
      );

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      console.error("Upload failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
        <p className="text-lg font-semibold">
          Loading upload page...
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

          <a
            href="/dashboard"
            className="rounded-full border px-5 py-2 text-sm font-semibold transition hover:bg-gray-100"
          >
            Back to Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Contributor Upload
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Upload an Image
            </h1>

            <p className="mt-3 text-gray-500">
              Submit your image to Heya. It will remain private until it is
              reviewed and approved.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="mb-2 block font-semibold">
                Image
              </label>

              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] || null)
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            {preview && (
              <div className="overflow-hidden rounded-2xl border bg-gray-100">
                <img
                  src={preview}
                  alt="Upload preview"
                  className="max-h-[450px] w-full object-contain"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block font-semibold">
                Title
              </label>

              <input
                type="text"
                placeholder="Example: Modern office workspace"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
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

            <div>
              <label className="mb-2 block font-semibold">
                Tags
              </label>

              <input
                type="text"
                placeholder="office, business, laptop, workspace"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              />

              <p className="mt-2 text-xs text-gray-500">
                Separate tags using commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Description
              </label>

              <textarea
                placeholder="Write a short description about the image..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="rounded-xl bg-yellow-50 px-4 py-4 text-sm text-yellow-800">
              Your submission is stored privately and will only become public
              after Heya approves it.
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {uploading
                ? "Uploading..."
                : "Submit Image for Review"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}