import { useProperty, GlobalFilters } from '@/contexts/PropertyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GlobalFilterBar() {
    const { currentProperty, allProperties, globalFilters, setGlobalFilters } = useProperty();

    if (!currentProperty || currentProperty.id !== 'all') return null;

    const handleFilterChange = (key: keyof GlobalFilters, value: string) => {
        setGlobalFilters(prev => ({ ...prev, [key]: value }));
    };

    // Extract unique districts and places from all properties
    const districts = Array.from(new Set(allProperties.map(p => {
        const parts = p.location.split(', ');
        return parts.length >= 2 ? parts[1] : '';
    }).filter(Boolean))).sort();

    const places = Array.from(new Set(allProperties.map(p => {
        return p.location.split(', ')[0];
    }).filter(Boolean))).sort();

    const filteredProperties = globalFilters.district !== 'All'
        ? allProperties.filter(p => p.location.includes(globalFilters.district))
        : globalFilters.place !== 'All'
            ? allProperties.filter(p => p.location.startsWith(globalFilters.place))
            : allProperties;

    return (
        <div className="bg-muted/30 border-b px-4 py-3 flex flex-wrap items-end gap-4 shadow-inner">
            <div className="flex-1 min-w-[150px] max-w-xs">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">District</Label>
                <Select value={globalFilters.district} onValueChange={(val) => {
                    setGlobalFilters({ ...globalFilters, district: val, place: 'All', resort: 'All' });
                }}>
                    <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="All Districts" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Districts</SelectItem>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 min-w-[150px] max-w-xs">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Place</Label>
                <Select value={globalFilters.place} onValueChange={(val) => {
                    setGlobalFilters({ ...globalFilters, place: val, resort: 'All' });
                }}>
                    <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="All Places" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Places</SelectItem>
                        {places.filter(p => {
                            const prop = allProperties.find(pr => pr.location.startsWith(p));
                            if (globalFilters.district !== 'All' && prop && !prop.location.includes(globalFilters.district)) return false;
                            return true;
                        }).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 min-w-[200px] max-w-sm">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Resort</Label>
                <Select value={globalFilters.resort} onValueChange={(val) => handleFilterChange('resort', val)}>
                    <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="All Resorts" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Resorts</SelectItem>
                        {filteredProperties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 min-w-[130px] max-w-[150px]">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">From Date</Label>
                <Input type="date" className="h-9 bg-background" value={globalFilters.fromDate} onChange={e => handleFilterChange('fromDate', e.target.value)} />
            </div>

            <div className="flex-1 min-w-[130px] max-w-[150px]">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">To Date</Label>
                <Input type="date" className="h-9 bg-background" value={globalFilters.toDate} onChange={e => handleFilterChange('toDate', e.target.value)} />
            </div>
        </div>
    );
}
