'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building, Send } from 'lucide-react';

interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  walletBalance: number;
  onContact?: (id: string) => void;
}

export function ClientCard({
  id,
  name,
  email,
  phone,
  company,
  status,
  walletBalance,
  onContact,
}: ClientCardProps) {
  const statusColor = status === 'active' ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-500/10 text-gray-700 dark:text-gray-400';

  return (
    <Card className="bg-card border-border p-6 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Building className="w-3 h-3" />
            {company}
          </p>
        </div>
        <Badge className={statusColor}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">
            {email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
            {phone}
          </a>
        </div>
      </div>

      <div className="bg-secondary/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-muted-foreground">Wallet Balance</p>
        <p className="text-xl font-bold text-accent mt-1">
          ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      <Button
        size="sm"
        className="w-full bg-accent hover:bg-accent/90 text-primary-foreground gap-2"
        onClick={() => onContact?.(id)}
      >
        <Send className="w-4 h-4" />
        Send Invoice
      </Button>
    </Card>
  );
}
