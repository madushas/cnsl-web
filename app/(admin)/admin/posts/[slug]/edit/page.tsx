import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await props.params;
  const [post] = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.slug, slug))
    .limit(1);
  if (!post)
    return (
      <div className="px-4 lg:px-6">
        <div className="text-sm text-red-400">Post not found</div>
      </div>
    );

  const initial = {
    slug: post.slug,
    title: post.title,
    excerpt: (post as any).excerpt || "",
    category: (post as any).category || "",
    image: (post as any).image || "",
    date: (post as any).date || "",
    author: (post as any).author || "",
    tags: (post as any).tags || "",
    content: (post as any).content || "",
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Admin · Edit Post</h1>
      </div>
      <div className="rounded-lg border p-4">
        <PostForm mode="edit" initial={initial} />
      </div>
    </div>
  );
}
