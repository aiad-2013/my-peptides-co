import { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';


interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featured_image: string;
  categories: { name: string; slug: string }[];
}

type CategoryFilter = 'all' | 'sarms' | 'peptides';

const fetchPosts = async (): Promise<BlogPostItem[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, date, featured_image, categories')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as BlogPostItem[];
};

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const Blog = () => {
  useSEO({
    title: 'SARMs & Peptides Research Blog | My Peptide Co',
    description: 'Stay informed with the latest research articles on SARMs, peptides, fitness science, and compound guides. Expert insights from My Peptide Co.',
  });

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchPosts,
  });

  const filtered = category === 'all'
    ? posts
    : posts.filter((p) => {
        const cats = Array.isArray(p.categories) ? p.categories : [];
        return cats.some((c: any) => {
          const s = (c.slug || '').toLowerCase();
          if (category === 'sarms') return s.includes('sarm');
          if (category === 'peptides') return s.includes('peptide');
          return false;
        });
      });

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'All Articles', value: 'all' },
    { label: 'SARMs', value: 'sarms' },
    { label: 'Peptides', value: 'peptides' },
  ];

  const handleCategoryChange = (value: CategoryFilter) => {
    setCategory(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
              onClick={() => handleCategoryChange(c.value)}
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

        {!isLoading && filtered.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mb-6">
            Showing {Math.min(filtered.length, (currentPage - 1) * POSTS_PER_PAGE + 1)}–{Math.min(filtered.length, currentPage * POSTS_PER_PAGE)} of {filtered.length} articles
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
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
            {paginated.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {(Array.isArray(post.categories) ? post.categories : []).map((c: any) => (
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

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); goToPage(currentPage - 1); }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    (page < currentPage - 1 || page > currentPage + 1)
                  ) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); goToPage(page); }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); goToPage(currentPage + 1); }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
