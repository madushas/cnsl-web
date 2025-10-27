import "server-only";
import { db } from "@/db";
import { events, posts, ticketTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Check if we already have data
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length > 0) {
      console.log("📊 Database already has data, skipping seed");
      return;
    }

    // Seed ticket templates
    console.log("🎫 Creating default ticket templates...");
    const defaultTemplate = await db.insert(ticketTemplates).values({
      name: "Default Event Ticket",
      qrConfig: {
        backgroundColor: "#ffffff",
        primaryColor: "#2563eb",
        secondaryColor: "#64748b",
        textColor: "#1e293b",
        fontFamily: "Inter",
        layout: "standard",
        showQR: true,
        showLogo: true,
        showEventDetails: true,
        showAttendeeInfo: true,
      },
      textOverlays: {
        title: { x: 50, y: 100, fontSize: 24, color: "#1e293b" },
        date: { x: 50, y: 140, fontSize: 16, color: "#64748b" },
        venue: { x: 50, y: 160, fontSize: 16, color: "#64748b" },
        attendee: { x: 50, y: 200, fontSize: 18, color: "#2563eb" },
      },
      isDefault: true,
    }).returning();

    // Seed sample events
    console.log("📅 Creating sample events...");
    const sampleEvents = [
      {
        title: "Tech Meetup: AI & Machine Learning",
        slug: "tech-meetup-ai-ml",
        description: "Join us for an exciting discussion about the latest trends in AI and Machine Learning. Network with fellow developers and learn from industry experts.",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        city: "San Francisco",
        venue: "Tech Hub Downtown",
        capacity: 100,
        published: true,
        topics: ["AI", "Machine Learning", "Technology"],
        speakers: [
          {
            name: "Dr. Sarah Chen",
            title: "AI Research Scientist",
            topic: "The Future of Neural Networks"
          }
        ],
        ticketTemplateId: defaultTemplate[0].id,
      },
      {
        title: "Startup Pitch Night",
        slug: "startup-pitch-night",
        description: "Watch innovative startups pitch their ideas to a panel of investors. Great networking opportunity for entrepreneurs and investors alike.",
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        city: "New York",
        venue: "Innovation Center",
        capacity: 150,
        published: true,
        topics: ["Startups", "Entrepreneurship", "Investing"],
        speakers: [
          {
            name: "Michael Rodriguez",
            title: "Venture Capitalist",
            topic: "What Investors Look For"
          }
        ],
        ticketTemplateId: defaultTemplate[0].id,
      },
      {
        title: "Web Development Workshop",
        slug: "web-dev-workshop",
        description: "Hands-on workshop covering modern web development practices. Bring your laptop and get ready to code!",
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        city: "Austin",
        venue: "Code Academy",
        capacity: 50,
        published: false, // Draft event
        topics: ["Web Development", "JavaScript", "React"],
        speakers: [
          {
            name: "Alex Thompson",
            title: "Senior Frontend Developer",
            topic: "Modern React Patterns"
          }
        ],
        ticketTemplateId: defaultTemplate[0].id,
      }
    ];

    await db.insert(events).values(sampleEvents);

    // Seed sample blog posts
    console.log("📝 Creating sample blog posts...");
    const samplePosts = [
      {
        title: "Building a Strong Tech Community",
        slug: "building-strong-tech-community",
        content: "Creating a thriving tech community requires dedication, consistent events, and genuine care for member growth. Here's what we've learned...",
        excerpt: "Learn the key principles behind building and maintaining a successful tech community.",
        published: true,
        tags: "Community,Technology,Leadership",
        date: new Date(),
        author: "CNSL Team",
      },
      {
        title: "The Future of Remote Work in Tech",
        slug: "future-remote-work-tech",
        content: "Remote work has fundamentally changed how we approach technology careers. Let's explore the trends and implications...",
        excerpt: "Exploring how remote work is reshaping the technology industry and career paths.",
        published: true,
        tags: "Remote Work,Technology,Career",
        date: new Date(),
        author: "CNSL Team",
      },
      {
        title: "Getting Started with Open Source",
        slug: "getting-started-open-source",
        content: "Contributing to open source projects can accelerate your career and help you build valuable connections. Here's how to start...",
        excerpt: "A beginner's guide to making your first open source contributions.",
        published: false, // Draft post
        tags: "Open Source,Career,Development",
        date: new Date(),
        author: "CNSL Team",
      }
    ];

    await db.insert(posts).values(samplePosts);

    console.log("✅ Database seed completed successfully!");
    console.log(`   - Created ${defaultTemplate.length} ticket template(s)`);
    console.log(`   - Created ${sampleEvents.length} sample event(s)`);
    console.log(`   - Created ${samplePosts.length} sample blog post(s)`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
