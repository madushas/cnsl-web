import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 section-spacing text-center">
        <div className="mx-auto max-w-xl">
          <h1 className="text-h1 text-white">404</h1>
          <p className="mt-4 text-xl text-gray-400">Page not found</p>
          <p className="mt-2 text-gray-500">
            The page you are looking for doesn’t exist or has been moved.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-linear-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-600"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
