import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ClientCard({ client, onEdit }: any) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{client.clientName}</h3>
          <p className="text-sm text-muted-foreground">
            Base Plan: ₹{client.monthlyPlan.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground">
            GST (18%): ₹{client.gst.toLocaleString('en-IN')} | Invoice: ₹
            {client.invoiceTotal.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Net Profit</p>
          <p className="text-lg font-bold text-green-500">
            ₹{client.netProfit.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Meta Ads</p>
          <p className="font-bold">
            ₹{client.metaAdSpend.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Video Cost</p>
          <p className="font-bold">
            ₹{client.outsourcedVideoCost.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Savings (10%)</p>
          <p className="font-bold text-emerald-500">
            ₹{client.savings.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onEdit}>
        Edit Expenses
      </Button>
    </Card>
  );
}
