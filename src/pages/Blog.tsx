import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface BlogPostItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage: string;
  categories: { name: string; slug: string }[];
}

type CategoryFilter = 'all' | 'sarms' | 'peptides';

const fetchPosts = async (): Promise<BlogPostItem[]> => {
  const { data, error } = await supabase.functions.invoke('get-blog-posts');
  if (error) throw error;
  return data;
};

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const Blog = () => {
  const [category, setCategory] = useState<CategoryFilter>('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchPosts,
  });

  const filtered = category === 'all'
    ? posts
    : posts.filter((p) =>
        p.categories.some((c) => {
          const s = c.slug.toLowerCase();
          if (category === 'sarms') return s.includes('sarm');
          if (category === 'peptides') return s.includes('peptide');
          return false;
        })
      );

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'All Articles', value: 'all' },
    { label: 'SARMs', value: 'sarms' },
    { label: 'Peptides', value: 'peptides' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          <Link to="/">
            <img src={logo} alt="VI CORPUS" className="h-10 md:h-12 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Learn &amp; Discover
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Stay informed with our latest research articles on SARMs, peptides, fitness, and well-being.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-full transition-all duration-200',
                category === c.value
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.categories.map((c) => (
                      <Badge key={c.slug} variant="secondary" className="capitalize text-xs">
                        {c.name}
                      </Badge>
                    ))}
                    {post.date && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-card-foreground leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stripHtml(post.excerpt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
