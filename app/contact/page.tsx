import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Heya",

  description:
    "Contact Heya for questions about stock photos, videos, contributor uploads, copyright concerns, privacy, or platform support.",

  alternates: {
    canonical: "/contact",
  },

  openGraph: {
    title: "Contact Heya",
    description:
      "Get in touch with Heya for support, contributor questions, copyright concerns, privacy requests and general enquiries.",
    url: "https://heya-stock.vercel.app/contact",
    siteName: "Heya",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Contact
          </p>

          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Get in touch with Heya
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Have a question about Heya, contributor uploads,
            copyright, privacy, downloads or anything else?
            You can reach us using the contact details below.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">
              General Support
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              For general questions, account-related enquiries,
              contributor support or feedback about Heya.
            </p>

            <p className="mt-6 text-sm font-semibold text-gray-500">
              Email
            </p>

            <a
              href="mailto:navyaramsetty@gmail.com"
              className="mt-2 inline-block break-all font-semibold underline"
            >
              navyaramsetty@gmail.com
            </a>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">
              Copyright & Content Concerns
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              If you believe content published on Heya infringes
              your rights, please contact us with the media URL and
              enough information for us to review the request.
            </p>

            <a
              href="mailto:navyaramsetty@gmail.com?subject=Heya%20Copyright%20Concern"
              className="mt-6 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Report Content
            </a>
          </div>

          <div className="rounded-3xl border bg-gray-50 p-8 md:col-span-2">
            <h2 className="text-2xl font-bold">
              When contacting us
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              To help us understand your request faster, include
              relevant details such as your account email, media title,
              page URL or a short description of the issue.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}