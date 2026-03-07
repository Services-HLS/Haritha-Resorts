import { useState } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { getPropertyStats, Invoice } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Eye, Receipt, Wallet, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { DataTablePagination } from '@/components/DataTablePagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const payBadge = (s: string) => {
  const v: Record<string, 'success' | 'warning' | 'destructive'> = { Paid: 'success', Partial: 'warning', Unpaid: 'destructive' };
  return <Badge variant={v[s]}>{s}</Badge>;
};

export default function BillingPayments() {
  const { currentProperty } = useProperty();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('invoices');

  if (!currentProperty) return null;

  const [currentPage, setCurrentPage] = useState(1);
  const [currentExpPage, setCurrentExpPage] = useState(1);
  const itemsPerPage = 10;

  const invoices = currentProperty.invoices || [];
  const expenses = currentProperty.expenses || [];

  const paginatedInvoices = invoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedExpenses = expenses.slice((currentExpPage - 1) * itemsPerPage, currentExpPage * itemsPerPage);

  const stats = getPropertyStats(currentProperty, '', '');
  const totalRevenue = stats.revenue;
  const totalExpense = stats.expenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Financial Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">₹{totalExpense.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${totalRevenue >= totalExpense ? 'bg-yellow-50/50 border-yellow-200' : 'bg-orange-50/50 border-orange-200'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${totalRevenue >= totalExpense ? 'text-yellow-700' : 'text-orange-700'}`}>Net Balance</p>
                <p className="text-2xl font-bold mt-1">₹{(totalRevenue - totalExpense).toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-lg ${totalRevenue >= totalExpense ? 'bg-yellow-100 text-yellow-600' : 'bg-orange-100 text-orange-600'}`}>
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Guest Invoices
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Property Expenses
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="invoices" className="mt-0 space-y-4">
          <div className="bg-card rounded-lg border card-shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                    <TableCell className="font-medium">{inv.guestName}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{payBadge(inv.status)}</TableCell>
                    <TableCell className="text-right font-semibold">₹{inv.grandTotal.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(inv)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination
              totalItems={invoices.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-0 space-y-4">
          <div className="bg-card rounded-lg border card-shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.length > 0 ? paginatedExpenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">{exp.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{exp.description}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">₹{exp.amount.toLocaleString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No expenses recorded yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <DataTablePagination
              totalItems={expenses.length}
              currentPage={currentExpPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentExpPage}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Invoice ID:</span>
                <span className="font-mono font-bold">{selected.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Guest:</span>
                <span className="font-medium">{selected.guestName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span>{selected.date}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Items</p>
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.description} (x{item.quantity})</span>
                    <span>₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{selected.total.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Tax ({currentProperty.taxPercentage}%)</span><span>₹{selected.tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{selected.grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-semibold text-muted-foreground">PAYMENT STATUS</span>
                {payBadge(selected.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
