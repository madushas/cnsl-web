import CheckpointScanner from "@/components/admin/checkpoint-scanner";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [event] = await db
    .select({ id: schema.events.id, title: schema.events.title })
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .limit(1);

  if (!event) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-sm text-red-400">Event not found</div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div>
        <h1 className="text-h2">Multi-Checkpoint Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan QR codes for entry, refreshments, and swag distribution
        </p>
      </div>
      <CheckpointScanner slug={slug} />
    </div>
  );
}
