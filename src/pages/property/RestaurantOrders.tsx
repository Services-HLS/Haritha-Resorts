import { useState } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { MenuItem, OrderStatus, RestaurantOrder } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const orderBadge = (s: OrderStatus) => {
  const v: Record<OrderStatus, 'warning' | 'success' | 'destructive'> = { Preparing: 'warning', Served: 'success', Cancelled: 'destructive' };
  return <Badge variant={v[s]}>{s}</Badge>;
};

export default function RestaurantOrders() {
  const { currentProperty, addRestaurantOrder, updateOrderStatus } = useProperty() as any;
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState('Main Course');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  if (!currentProperty || !currentProperty.hasRestaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-fade-in">
        <UtensilsCrossed className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Restaurant Module Inactive</h2>
        <p className="text-sm">This property does not have an active restaurant facility.</p>
      </div>
    );
  }

  // Ensure menuItems exist
  const menuItems: MenuItem[] = currentProperty.menuItems || [];
  const categories: string[] = [...new Set(menuItems.map(m => m.category))];
  const filteredItems = menuItems.filter(m => m.category === activeCategory);

  // Simulated Tables (1-10)
  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.item.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const placeOrder = () => {
    if (!selectedTable) {
      toast({ title: "Select a Table", description: "Please select a table number before placing the order.", variant: "destructive" });
      return;
    }
    if (cart.length === 0) return;

    const total = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
    const newOrder: RestaurantOrder = {
      id: `ord-${Date.now()}`,
      tableNumber: selectedTable,
      items: cart.map(c => ({ menuItem: c.item, quantity: c.qty })),
      status: 'Preparing',
      total,
      timestamp: new Date().toISOString()
    };

    addRestaurantOrder(newOrder, currentProperty.id);
    setCart([]);
    setSelectedTable(null);
    toast({ title: "Order Placed", description: `Order for Table ${selectedTable} has been sent to the kitchen.` });
  };

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus, currentProperty.id);
  };

  const total = cart.reduce((s, c) => s + c.item.price * c.qty, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Management</h1>
          <p className="text-muted-foreground text-sm">Manage tables, menu items and live orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tables & Menu */}
        <div className="lg:col-span-8 space-y-6">
          {/* Table Selection */}
          <section className="bg-card rounded-xl border p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Select Table
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {tables.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={cn(
                    "h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center",
                    selectedTable === t
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                      : "hover:border-primary/50 bg-background"
                  )}
                >
                  T-{t}
                </button>
              ))}
            </div>
          </section>

          {/* Menu */}
          <section className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full px-4 shrink-0 transition-all"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-card group rounded-xl border p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all relative overflow-hidden active:scale-95"
                >
                  <div className="flex flex-col h-full justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-primary font-bold">₹{item.price}</p>
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Orders Log */}
          <section>
            <h3 className="font-bold text-base mb-3">Live Order Status</h3>
            <div className="grid gap-3">
              {(currentProperty.orders || []).length === 0 ? (
                <div className="text-center py-10 border rounded-xl border-dashed">
                  <p className="text-xs text-muted-foreground">No active orders found.</p>
                </div>
              ) : (
                currentProperty.orders.slice(0, 8).map(ord => (
                  <div key={ord.id} className="bg-card rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all border-l-4 border-l-primary">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">
                        {ord.tableNumber}
                      </div>
                      <div>
                        <p className="font-bold text-sm">Table {ord.tableNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{ord.items.length} dishes • {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right mr-2">
                        <p className="font-bold text-sm">₹{ord.total}</p>
                        {orderBadge(ord.status)}
                      </div>
                      {ord.status === 'Preparing' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-success text-success hover:bg-success/10" onClick={() => handleStatusChange(ord.id, 'Served')}>
                          Serve Order
                        </Button>
                      )}
                      {ord.status === 'Served' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground" disabled>Completed</Button>
                        </div>
                      )}
                      {ord.status === 'Preparing' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleStatusChange(ord.id, 'Cancelled')}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Cart Summary */}
        <div className="lg:col-span-4 h-fit sticky top-6">
          <div className="bg-card rounded-2xl border shadow-xl flex flex-col overflow-hidden">
            <div className="bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h3 className="font-bold">Current Bill</h3>
              </div>
              {selectedTable && <p className="text-xs opacity-80 mt-1 font-medium">Table: {selectedTable}</p>}
            </div>

            <div className="p-5 flex-1 min-h-[300px]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                  <UtensilsCrossed className="h-12 w-12 mb-2" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs">Add items from the menu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {cart.map(c => (
                      <div key={c.item.id} className="flex items-start justify-between gap-3 animate-in slide-in-from-right-2">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{c.item.name}</p>
                          <p className="text-xs text-muted-foreground">₹{c.item.price} x {c.qty}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background" onClick={() => updateQty(c.item.id, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-5 text-center text-xs font-black">{c.qty}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background" onClick={() => updateQty(c.item.id, 1)}><Plus className="h-3 w-3" /></Button>
                          </div>
                          <p className="font-bold text-sm">₹{c.item.price * c.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Subtotal</span><span>₹{total}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Tax (5%)</span><span>₹{(total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black pt-1">
                      <span>Grand Total</span><span className="text-primary">₹{(total * 1.05).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-all"
                    onClick={placeOrder}
                    disabled={!selectedTable}
                  >
                    Confirm & Place Order
                  </Button>
                  {!selectedTable && <p className="text-[10px] text-destructive text-center font-bold">Please select a table first</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple X icon replacement
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  )
}
