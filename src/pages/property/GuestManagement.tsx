import { useState } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { Guest } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { DataTablePagination } from '@/components/DataTablePagination';

export default function GuestManagement() {
  const { currentProperty } = useProperty();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Guest | null>(null);

  if (!currentProperty) return null;

  const guests = currentProperty.guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page on search
  useState(() => setCurrentPage(1));

  const paginatedData = guests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Guest Management</h1>
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search guests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="bg-card rounded-lg border card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>ID Type</TableHead>
              <TableHead>Stays</TableHead>
              <TableHead>Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(g => (
              <TableRow key={g.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelected(g)}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>{g.email}</TableCell>
                <TableCell>{g.phone}</TableCell>
                <TableCell><Badge variant="secondary">{g.idType}</Badge></TableCell>
                <TableCell>{g.totalStays}</TableCell>
                <TableCell>₹{g.totalSpent.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTablePagination
          totalItems={guests.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Guest Profile</SheetTitle></SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="space-y-2">
                <p className="text-lg font-semibold">{selected.name}</p>
                <p className="text-muted-foreground">{selected.email}</p>
                <p className="text-muted-foreground">{selected.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent rounded-lg p-3"><p className="text-xs text-muted-foreground">ID</p><p className="font-medium">{selected.idType}: {selected.idNumber}</p></div>
                <div className="bg-accent rounded-lg p-3"><p className="text-xs text-muted-foreground">Total Stays</p><p className="font-medium">{selected.totalStays}</p></div>
                <div className="bg-accent rounded-lg p-3 col-span-2"><p className="text-xs text-muted-foreground">Total Spent</p><p className="font-semibold text-lg">₹{selected.totalSpent.toLocaleString()}</p></div>
              </div>
              <div>
                <p className="font-medium mb-2">Booking IDs</p>
                <div className="flex flex-wrap gap-1">
                  {selected.bookings.map(id => <Badge key={id} variant="outline" className="text-xs">{id}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
