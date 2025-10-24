import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function UniversityOutreachPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 section-spacing">
        <h1 className="text-h1 text-white">University Outreach</h1>
        <p className="mt-4 max-w-3xl text-gray-400">
          Request sessions for your department and collaborate with CNSL to deliver workshops and talks on campus.
        </p>
      </main>
      <Footer />
    </div>
  )
}
  export const dynamic = 'force-static'
