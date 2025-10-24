import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function MonthlyMeetupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 section-spacing">
        <h1 className="text-h1 text-white">Monthly Meetups</h1>
        <p className="mt-4 max-w-3xl text-gray-400">
          Casual tech meetups with talks, panels, and networking. Submit a talk
          proposal or RSVP for the next event.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = 'force-static'
