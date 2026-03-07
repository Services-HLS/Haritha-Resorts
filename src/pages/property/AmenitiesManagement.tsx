import { useProperty } from '@/contexts/PropertyContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AmenitiesManagement() {
  const { currentProperty } = useProperty();
  if (!currentProperty) return null;

  const usageData = [
    { month: 'Jan', pool: 120, playzone: 80 },
    { month: 'Feb', pool: 150, playzone: 95 },
    { month: 'Mar', pool: 200, playzone: 110 },
    { month: 'Apr', pool: 280, playzone: 140 },
    { month: 'May', pool: 320, playzone: 160 },
    { month: 'Jun', pool: 350, playzone: 200 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Amenities Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border card-shadow p-4">
          <div className="flex items-center justify-between">
            <Label>Restaurant</Label>
            <Switch checked={currentProperty.hasRestaurant} />
          </div>
        </div>
        <div className="bg-card rounded-lg border card-shadow p-4">
          <div className="flex items-center justify-between">
            <Label>Swimming Pool</Label>
            <Switch checked={currentProperty.hasPool} />
          </div>
        </div>
        <div className="bg-card rounded-lg border card-shadow p-4">
          <div className="flex items-center justify-between">
            <Label>Playzone</Label>
            <Switch checked={currentProperty.hasPlayzone} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border card-shadow p-5">
        <h3 className="font-semibold text-sm mb-4">Usage Reports</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {currentProperty.hasPool && <Bar dataKey="pool" fill="hsl(152, 60%, 36%)" name="Pool" radius={[4, 4, 0, 0]} />}
            {currentProperty.hasPlayzone && <Bar dataKey="playzone" fill="hsl(38, 92%, 50%)" name="Playzone" radius={[4, 4, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
