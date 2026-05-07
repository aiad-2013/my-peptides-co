import { useState } from 'react';
import { z } from 'zod';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Mail, Send, Clock } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

const ContactUs = () => {
  useSEO({
    title: 'Contact Us | My Peptide Co',
    description:
      'Reach the My Peptide Co team for questions about a compound, an order, or a research collaboration. We typically respond within 1 business day.',
  });

  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const subject = encodeURIComponent(form.subject?.trim() || `Enquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:info@mypeptideco.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: 'Opening your email app',
        description: "If nothing happens, email us directly at info@mypeptideco.com.",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get in touch with our team for product questions, order support, or research enquiries.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
          {/* Left column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Reach our team</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about a compound, an order, or a research collaboration? We typically respond within 1 business day.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">Email</p>
                  <a href="mailto:info@mypeptideco.com" className="text-foreground hover:text-accent transition-colors">
                    info@mypeptideco.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">Location</p>
                  <p className="text-foreground">Melbourne, Australia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">Response Time</p>
                  <p className="text-foreground">Within 1 business day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - form */}
          <div className="border border-border rounded-xl bg-card p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Jane Smith"
                    maxLength={100}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="jane@example.com"
                    maxLength={255}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="mb-2 block">
                  Subject <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={handleChange('subject')}
                  placeholder="How can we help?"
                  maxLength={150}
                />
              </div>

              <div>
                <Label htmlFor="message" className="mb-2 block">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Tell us a bit about your enquiry..."
                  rows={6}
                  maxLength={2000}
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={submitting} className="gap-2">
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
