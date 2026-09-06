"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    try {
      setUploading(true);

      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in to upload images.");
      }

      // Get file extension
      const fileExtension = imageFile.name.split(".").pop();

      if (!fileExtension) {
        throw new Error("Invalid image file.");
      }

      // Create unique filename
      const safeFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      // Store inside logged-in user's folder
      const filePath = `${user.id}/${safeFileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public image URL
      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // Save image details in database
      const { error: databaseError } = await supabase
        .from("images")
        .insert([
          {
            title: title.trim(),
            category,
            tags: tags.trim(),
            description: description.trim(),
            image_url: imageUrl,
            downloads: 0,
            featured: false,
            user_id: user.id,
            status: "pending",
          },
        ]);

      if (databaseError) {
        // Remove uploaded file if database insert fails
        await supabase.storage
          .from("images")
          .remove([filePath]);

        throw databaseError;
      }

      alert("Image uploaded successfully and sent for review!");

      // Clear form
      setTitle("");
      setCategory("");
      setTags("");
      setDescription("");
      setImageFile(null);

      const fileInput = document.getElementById(
        "imageFile"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(`Upload failed: ${message}`);
    } finally {
      setUploading(false);
    }
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
          <a href="/" className="text-2xl font-bold">
            Heya
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full border px-5 py-2 text-sm font-semibold"
            >
              Back to Website
            </a>

            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Upload Stock Image
          </h1>

          <p className="mt-3 text-gray-600">
            Upload a new stock image to Heya.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block font-semibold">
              Image Title
            </label>

            <input
              type="text"
              placeholder="Example: Modern Business Office"
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
              <option value="">Select Category</option>
              <option value="Business">Business</option>
              <option value="Nature">Nature</option>
              <option value="Technology">Technology</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Backgrounds">Backgrounds</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Tags
            </label>

            <input
              type="text"
              placeholder="business, office, corporate, marketing"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-2 text-sm text-gray-500">
              Separate tags using commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              placeholder="Write a short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Upload Image
            </label>

            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(
                  e.target.files
                    ? e.target.files[0]
                    : null
                )
              }
              required
              className="w-full rounded-xl border p-3"
            />

            {imageFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </button>
        </form>
      </section>
    </main>
  );
}