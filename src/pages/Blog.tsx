import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/data/blogPosts';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import logo from '@/assets/logo.png';

type CategoryFilter = 'all' | 'sarms' | 'peptides';

const Blog = () => {
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filtered = category === 'all'
    ? blogPosts
    : blogPosts.filter((p) => p.category === category);

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'All Articles', value: 'all' },
    { label: 'SARMs', value: 'sarms' },
    { label: 'Peptides', value: 'peptides' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Learn &amp; Discover
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Stay informed with our latest research articles on SARMs, peptides, fitness, and well-being.
          </p>
        </div>

        {/* Category Filter */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {post.category}
                  </Badge>
                  {post.date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                  )}
                </div>
                <h3 className="font-serif font-semibold text-card-foreground leading-snug mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Read Article
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
