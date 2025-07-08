"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import BlogCard, { FeaturedBlogCard } from "./BlogCard";
import { BlogPost } from "@/lib/types";

const categories = [
  "All",
  "Announcements", 
  "Tutorials",
  "Event Recaps",
  "Member Stories",
];

const POSTS_PER_PAGE = 6;

interface BlogClientProps {
  readonly posts: readonly BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  // Filter posts based on search term and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  // Posts to display based on visible count
  const displayedPosts = filteredPosts.slice(0, visiblePosts);
  const hasMorePosts = visiblePosts < filteredPosts.length;

  const handleLoadMore = async () => {
    setIsLoading(true);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisiblePosts(prev => Math.min(prev + POSTS_PER_PAGE, filteredPosts.length));
    setIsLoading(false);
  };

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category);
    setVisiblePosts(POSTS_PER_PAGE); // Reset pagination when filter changes
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setVisiblePosts(POSTS_PER_PAGE); // Reset pagination when search changes
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setVisiblePosts(POSTS_PER_PAGE);
  };

  return (
    <>
      {/* Search and Filter */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles, topics, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-12 bg-background border-border focus:border-primary transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory !== "All") && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {filteredPosts.length} results</span>
              {searchTerm && (
                <span>for &ldquo;{searchTerm}&rdquo;</span>
              )}
              {selectedCategory !== "All" && (
                <span>in {selectedCategory}</span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Featured Blog Post - Only show if no filters applied */}
      {!searchTerm && selectedCategory === "All" && posts.length > 0 && posts[0] && (
        <div className="mb-16">
          <FeaturedBlogCard post={posts[0]} />
        </div>
      )}

      {/* Blog Posts Grid */}
      {displayedPosts.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayedPosts
              .slice(searchTerm || selectedCategory !== "All" ? 0 : 1) // Skip first post if showing featured
              .map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
          </div>

          {/* Load More Button */}
          {hasMorePosts && (
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Articles Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria."
                : "We're working on creating amazing content for you. Check back soon!"}
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <Button onClick={resetFilters}>Clear filters</Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
