import { useState } from 'react';
import { FlaskConical, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface LabTestFormProps {
  productId: string;
  productName: string;
}

export const LabTestForm = ({ productId, productName }: LabTestFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: dbError } = await supabase
      .from('lab_test_requests')
      .insert({
        product_id: productId,
        product_name: productName,
        name,
        email,
        phone: phone || null,
      });

    setLoading(false);

    if (dbError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Request Received</h3>
        <p className="text-muted-foreground text-sm">
          Thank you, <span className="font-medium text-foreground">{name}</span>. We'll send the third-party lab results for <span className="font-medium text-foreground">{productName}</span> to <span className="font-medium text-foreground">{email}</span> shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Request Lab Test Results</h3>
          <p className="text-xs text-muted-foreground">Get third-party certificate of analysis sent to your inbox</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-5 pl-12">
        All our products are independently tested. Fill in your details and we'll email you the full CoA for <span className="font-medium text-foreground">{productName}</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="lab-name">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="lab-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lab-phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="lab-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+61 400 000 000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lab-email">Email Address <span className="text-destructive">*</span></Label>
          <Input
            id="lab-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          variant="gold-outline"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Request…
            </>
          ) : (
            <>
              <FlaskConical className="w-4 h-4" />
              Request Lab Results
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
