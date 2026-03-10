import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  featured_image: string;
  categories: { name: string; slug: string }[];
}

const fetchPost = async (slug: string): Promise<BlogPostData> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as unknown as BlogPostData;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Article not found</h2>
            <p className="text-muted-foreground mb-6">Sorry, we couldn't find this article.</p>
            <Link to="/blog">
              <Button variant="gold">Back to Blog</Button>
            </Link>
          </div>
        ) : post ? (
          <article>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(Array.isArray(post.categories) ? post.categories : []).map((c: any) => (
                <Badge key={c.slug} variant="secondary" className="capitalize text-xs">
                  {c.name}
                </Badge>
              ))}
              {post.date && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            {post.featured_image && (
              <div className="rounded-lg overflow-hidden mb-8">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-p:text-foreground/85 prose-p:leading-relaxed
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-ul:text-foreground/85 prose-ol:text-foreground/85
                prose-li:marker:text-accent
                prose-img:rounded-lg
                prose-blockquote:border-accent prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-12 pt-8 border-t border-border">
              <Link to="/blog" className="inline-flex items-center gap-2 text-accent hover:underline font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to all articles
              </Link>
            </div>
          </article>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
