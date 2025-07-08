import EventsClient from './EventsClient'
import { events } from '@/lib/events-data'

export default function Events() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <header className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our regular meetups, workshops, and conferences. Connect with fellow developers,
            learn from industry experts, and grow your cloud-native skills.
          </p>
        </header>

        <EventsClient events={events} />
      </div>
    </section>
  )
}
