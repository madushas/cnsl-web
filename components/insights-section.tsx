"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type PostItem = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
};

export function InsightsSection({ initial }: { initial?: PostItem[] }) {
  // Server always provides data - no client fetch needed (CSR-02 fix)
  const data = initial || [];

  const latest = [...data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section className="container mx-auto px-4 section-spacing">
      <div className="mb-12 md:mb-16 text-center">
        <h2 className="mb-4 text-h2 text-foreground">Latest Insights & News</h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Stay updated with our latest stories and community highlights
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {latest.map((post, idx) => (
          <Reveal key={post.slug} delay={idx * 60}>
            <Card className="group relative overflow-hidden bg-card border-border transition-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer">
              <div className="relative aspect-4/3 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 opacity-30" />
                <Image
                  src={post.image || "/cnsl-placeholder.svg"}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <Badge
                  variant="default"
                  className="absolute left-4 top-4 z-20 shadow-sm"
                >
                  {post.category}
                </Badge>
              </div>

              <CardContent className="card-padding space-y-3">
                <h3 className="text-h3 text-foreground group-hover:text-blue-400 transition-colors leading-tight">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium pt-2">
                  <span>Read more</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
              <Link
                href={`/blog/${post.slug}`}
                aria-label={`Read: ${post.title}`}
                className="absolute inset-0 z-30"
              />
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
