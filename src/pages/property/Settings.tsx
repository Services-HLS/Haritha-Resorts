import { useState } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currentProperty } = useProperty();

  const [name, setName] = useState(currentProperty?.name || '');
  const [location, setLocation] = useState(currentProperty?.location || '');
  const [tax, setTax] = useState(String(currentProperty?.taxPercentage || 0));
  const [hasRestaurant, setRestaurant] = useState(currentProperty?.hasRestaurant || false);
  const [hasPool, setPool] = useState(currentProperty?.hasPool || false);
  const [hasPlayzone, setPlayzone] = useState(currentProperty?.hasPlayzone || false);

  if (!currentProperty) return null;

  const handleSave = () => toast.success('Settings saved successfully');

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="bg-card rounded-lg border card-shadow p-6 space-y-4">
        <h2 className="font-semibold">Property Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Property Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1" /></div>
          <div><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} className="mt-1" /></div>
          <div><Label>Tax Percentage (%)</Label><Input type="number" value={tax} onChange={e => setTax(e.target.value)} className="mt-1" /></div>
        </div>
      </div>

      <div className="bg-card rounded-lg border card-shadow p-6 space-y-4">
        <h2 className="font-semibold">Features</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="rest" checked={hasRestaurant} onCheckedChange={(v) => setRestaurant(!!v)} />
            <Label htmlFor="rest">Restaurant</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="pool" checked={hasPool} onCheckedChange={(v) => setPool(!!v)} />
            <Label htmlFor="pool">Swimming Pool</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="play" checked={hasPlayzone} onCheckedChange={(v) => setPlayzone(!!v)} />
            <Label htmlFor="play">Playzone</Label>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border card-shadow p-6 space-y-4">
        <h2 className="font-semibold">Room Types & Pricing</h2>
        <div className="space-y-2 text-sm">
          {['Standard', 'Deluxe', 'Suite', 'Premium', 'Cottage'].map(type => {
            const rooms = currentProperty.rooms.filter(r => r.type === type);
            const avgPrice = rooms.length ? Math.round(rooms.reduce((s, r) => s + r.pricePerNight, 0) / rooms.length) : 0;
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="font-medium">{type}</span>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{rooms.length} rooms</span>
                  <span>Avg ₹{avgPrice.toLocaleString()}/night</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
}
