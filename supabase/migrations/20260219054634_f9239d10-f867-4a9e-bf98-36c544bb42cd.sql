
-- Create blog_posts table for static blog content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  date TIMESTAMP WITH TIME ZONE,
  featured_image TEXT,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read blog posts (public content)
CREATE POLICY "Blog posts are publicly readable"
ON public.blog_posts
FOR SELECT
USING (true);

-- Create index on slug for fast lookups
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_date ON public.blog_posts(date DESC);
