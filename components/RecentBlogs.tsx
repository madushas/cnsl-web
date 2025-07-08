import { ArrowRight } from "lucide-react";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import { blogContent } from "@/lib/blog-content";
import Image from "next/image";

const recentPosts = blogContent.posts.toSorted((a,b)=>{
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}).slice(0, 3);

const RecentBlogs = () => {
    return (
        <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Latest Insights
            </h2>
            <p className="text-lg text-muted-foreground">
              Stay updated with our latest tutorials and community stories
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Card key={post.id} className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
                <Image 
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  width={400}
                  height={200}
                />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <CardAction className="text-primary hover:text-primary/80">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                  </CardAction>

                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/blog">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
}

export default RecentBlogs;