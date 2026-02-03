'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ClientForm } from '@/components/client-form';
import { ClientCard } from '@/components/client-card';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

interface DigitalClient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  walletBalance: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<DigitalClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/digital-clients');
      const data = await response.json();
      setClients(data.data || []);
    } catch (error) {
      console.log('[v0] Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSendInvoice = (clientId: string) => {
    console.log('[v0] Send invoice to client:', clientId);
  };

  const getFilteredClients = (status: string) => {
    if (status === 'all') return clients;
    return clients.filter((c) => c.status === status);
  };

  const stats = {
    active: clients.filter((c) => c.status === 'active').length,
    inactive: clients.filter((c) => c.status === 'inactive').length,
    totalWallet: clients.reduce((sum, c) => sum + c.walletBalance, 0),
  };

  return (
    <DashboardLayout
      title="Digital Clients"
      subtitle="Manage your digital clients and their accounts"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
              <p className="text-3xl font-bold text-foreground mt-2">{clients.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.active} active, {stats.inactive} inactive
              </p>
            </div>
            <Users className="w-8 h-8 text-accent/30" />
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Wallet Balance</h3>
              <p className="text-3xl font-bold text-accent mt-2">
                ${stats.totalWallet.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Across all clients</p>
            </div>
            <DollarSign className="w-8 h-8 text-accent/30" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active Rate</h3>
              <p className="text-3xl font-bold text-accent mt-2">
                {clients.length > 0 ? ((stats.active / clients.length) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.active} active clients
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent/30" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <ClientForm onClientCreated={() => fetchClients()} />
        </div>

        {/* Clients Column */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border mb-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-accent">
                All ({clients.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-accent">
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="data-[state=active]:bg-accent">
                Inactive ({stats.inactive})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {loading ? (
                <Card className="bg-card border-border p-8">
                  <p className="text-muted-foreground text-center">Loading clients...</p>
                </Card>
              ) : clients.length === 0 ? (
                <Card className="bg-card border-border p-8">
                  <p className="text-muted-foreground text-center">No clients yet</p>
                </Card>
              ) : (
                getFilteredClients('all').map((client) => (
                  <ClientCard
                    key={client._id}
                    id={client._id}
                    name={client.name}
                    email={client.email}
                    phone={client.phone}
                    company={client.company}
                    status={client.status}
                    walletBalance={client.walletBalance}
                    onContact={handleSendInvoice}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-3">
              {getFilteredClients('active').length === 0 ? (
                <Card className="bg-card border-border p-8">
                  <p className="text-muted-foreground text-center">No active clients</p>
                </Card>
              ) : (
                getFilteredClients('active').map((client) => (
                  <ClientCard
                    key={client._id}
                    id={client._id}
                    name={client.name}
                    email={client.email}
                    phone={client.phone}
                    company={client.company}
                    status={client.status}
                    walletBalance={client.walletBalance}
                    onContact={handleSendInvoice}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-3">
              {getFilteredClients('inactive').length === 0 ? (
                <Card className="bg-card border-border p-8">
                  <p className="text-muted-foreground text-center">No inactive clients</p>
                </Card>
              ) : (
                getFilteredClients('inactive').map((client) => (
                  <ClientCard
                    key={client._id}
                    id={client._id}
                    name={client.name}
                    email={client.email}
                    phone={client.phone}
                    company={client.company}
                    status={client.status}
                    walletBalance={client.walletBalance}
                    onContact={handleSendInvoice}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
