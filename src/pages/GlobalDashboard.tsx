import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '@/contexts/PropertyContext';
import { properties as dummyProps, getPropertyStats } from '@/data/mockData';
import { DashboardCard } from '@/components/DashboardCard';
import { BookingFormModal } from '@/components/BookingFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2, BedDouble, CalendarCheck, CalendarMinus, BookOpen, Percent,
  IndianRupee, MapPin, Filter, X, ChevronDown, ChevronUp, Wallet
} from 'lucide-react';

function MultiSelectDropdown({ options, selected, onChange, placeholder, disabled }: { options: { value: string, label: string }[], selected: string[], onChange: (v: string[]) => void, placeholder: string, disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div
        className="flex min-h-[40px] w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 ? <span className="text-muted-foreground">{placeholder}</span> :
          selected.map((s, i) => {
            if (i > 1) {
              if (i === 2) return <span key="more" className="text-xs text-muted-foreground">+{selected.length - 2} more</span>;
              return null;
            }
            const label = options.find(o => o.value === s)?.label || s;
            return (
              <span key={s} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-primary/20">
                {label}
                <X className="h-3 w-3 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onChange(selected.filter(x => x !== s)); }} />
              </span>
            );
          })}
        <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground opacity-50" />
      </div>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg p-2">
          {options.length === 0 ? <div className="p-2 text-xs text-muted-foreground">No options available for selected mode</div> : options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted cursor-pointer rounded">
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={(e) => {
                if (e.target.checked) onChange([...selected, opt.value]);
                else onChange(selected.filter(x => x !== opt.value));
              }} className="rounded h-4 w-4 border-primary/50 text-primary accent-primary" />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GlobalDashboard() {
  const navigate = useNavigate();
  const { setCurrentProperty, allProperties, globalFilters, setGlobalFilters } = useProperty();

  const [showNewBooking, setShowNewBooking] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [bookingPropId, setBookingPropId] = useState<string | undefined>();

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDateRange, setSelectedDateRange] = useState({ from: '', to: '' });
  const [dateMode, setDateMode] = useState<'Range' | 'Single'>('Range');
  const [filterMode, setFilterMode] = useState('All Properties');

  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [appliedFilters, setAppliedFilters] = useState({
    selectedDateRange: { from: '', to: '' },
    filterMode: 'All Properties',
    selectedDistricts: [] as string[],
    selectedStates: [] as string[],
    selectedPlaces: [] as string[],
    selectedProperties: [] as string[],
    selectedAmenities: [] as string[]
  });

  const clearFilters = () => {
    setSelectedDateRange({ from: '', to: '' });
    setDateMode('Range');
    setFilterMode('All Properties');
    setSelectedDistricts([]);
    setSelectedStates([]);
    setSelectedPlaces([]);
    setSelectedProperties([]);
    setSelectedAmenities([]);

    setAppliedFilters({
      selectedDateRange: { from: '', to: '' },
      filterMode: 'All Properties',
      selectedDistricts: [],
      selectedStates: [],
      selectedPlaces: [],
      selectedProperties: [],
      selectedAmenities: []
    });
  };

  const applyFilters = () => {
    setAppliedFilters({
      selectedDateRange,
      filterMode,
      selectedDistricts,
      selectedStates,
      selectedPlaces,
      selectedProperties,
      selectedAmenities
    });

    // Sync back to context values
    setGlobalFilters(prev => ({
      ...prev,
      fromDate: selectedDateRange.from,
      toDate: selectedDateRange.to
    }));

    // Save to local storage for other components like Chatbot to read context
    try {
      localStorage.setItem('hms_dashboard_filters', JSON.stringify({
        selectedDateRange
      }));
    } catch (e) { }
  };

  // Sync context filters to dashboard applied filters only ONCE on mount or if context values actually change from outside
  useEffect(() => {
    if (globalFilters.fromDate !== selectedDateRange.from || globalFilters.toDate !== selectedDateRange.to) {
      if (globalFilters.fromDate || globalFilters.toDate) {
        setSelectedDateRange({ from: globalFilters.fromDate || '', to: globalFilters.toDate || '' });
        setAppliedFilters(prev => ({
          ...prev,
          selectedDateRange: { from: globalFilters.fromDate || '', to: globalFilters.toDate || '' }
        }));
      }
    }
  }, [globalFilters.fromDate, globalFilters.toDate]);

  const processedData = useMemo(() => {
    let fProps = allProperties;

    // First apply Global Master Filters from Context
    if (globalFilters.district !== 'All') {
      fProps = fProps.filter(p => p.location.includes(globalFilters.district));
    }
    if (globalFilters.place !== 'All') {
      fProps = fProps.filter(p => p.location.includes(globalFilters.place));
    }
    if (globalFilters.resort !== 'All') {
      fProps = fProps.filter(p => p.id === globalFilters.resort);
    }

    const { filterMode, selectedDistricts, selectedStates, selectedPlaces, selectedProperties, selectedAmenities, selectedDateRange } = appliedFilters;

    // 1. Filter Property Grouping
    if (filterMode === 'District-wise' && selectedDistricts.length > 0) {
      fProps = fProps.filter(p => {
        const parts = p.location.split(', ').map(s => s.trim());
        const district = parts.length > 1 ? parts[1] : parts[0];
        return selectedDistricts.includes(district);
      });
    } else if (filterMode === 'State-wise' && selectedStates.length > 0) {
      fProps = fProps.filter(p => {
        const parts = p.location.split(', ').map(s => s.trim());
        const state = parts.length > 2 ? parts[2] : (parts.length > 1 ? parts[1] : parts[0]);
        return selectedStates.includes(state);
      });
    } else if (filterMode === 'Place-wise' && selectedPlaces.length > 0) {
      fProps = fProps.filter(p => {
        const parts = p.location.split(', ').map(s => s.trim());
        return selectedPlaces.includes(parts[0]);
      });
    } else if (filterMode === 'Individual Property' && selectedProperties.length > 0) {
      fProps = fProps.filter(p => selectedProperties.includes(p.id));
    }

    if (selectedAmenities.length > 0) {
      fProps = fProps.filter(p => {
        let m = true;
        if (selectedAmenities.includes('Hotel + Restaurant') && !p.hasRestaurant) m = false;
        if (selectedAmenities.includes('Swimming Pool') && !p.hasPool) m = false;
        if (selectedAmenities.includes('Playzone') && !p.hasPlayzone) m = false;
        return m;
      });
    }

    return fProps;
  }, [allProperties, appliedFilters, todayStr]);


  const stats = useMemo(() => {
    let totalRooms = 0, totalBookings = 0, todayCheckIns = 0, todayCheckOuts = 0, totalRevenue = 0, totalExpenses = 0, totalOccupiedRooms = 0;

    const fStart = appliedFilters.selectedDateRange.from;
    const fEnd = appliedFilters.selectedDateRange.to;

    // We use allProperties for the base counts if no location filters are applied, 
    // but processedData already handles the location/amenity filtering.
    processedData.forEach(p => {
      const ps = getPropertyStats(p, fStart, fEnd);
      totalRooms += ps.totalRooms;
      totalOccupiedRooms += ps.occupied;
      totalBookings += ps.todayBookings;
      todayCheckIns += ps.todayCheckIns;
      todayCheckOuts += ps.todayCheckOuts;
      totalRevenue += ps.revenue;
      totalExpenses += ps.expenses;
    });

    return {
      totalProperties: processedData.length,
      totalRooms,
      todayCheckIns,
      todayCheckOuts,
      totalBookings,
      occupancyPercentage: totalRooms > 0 ? Math.round((totalOccupiedRooms / totalRooms) * 100) : 0,
      totalRevenue,
      totalExpenses,
    };
  }, [processedData, appliedFilters.selectedDateRange, todayStr]);

  const locationOptions = useMemo(() => {
    const map = new Map();
    allProperties.forEach(p => {
      const parts = p.location.split(', ').map(s => s.trim());
      const place = parts[0];
      const district = parts.length > 1 ? parts[1] : parts[0];
      const state = parts.length > 2 ? parts[2] : (parts.length > 1 ? parts[1] : parts[0]);

      if (filterMode === 'District-wise') map.set(district, district);
      else if (filterMode === 'State-wise') map.set(state, state);
      else if (filterMode === 'Place-wise') map.set(place, place);
      else if (filterMode === 'Individual Property') map.set(p.id, p.name);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [filterMode, allProperties]);

  const selectedLocationValues =
    filterMode === 'District-wise' ? selectedDistricts :
      filterMode === 'State-wise' ? selectedStates :
        filterMode === 'Place-wise' ? selectedPlaces :
          filterMode === 'Individual Property' ? selectedProperties : [];

  const handleLocationChange = (vals: string[]) => {
    if (filterMode === 'District-wise') setSelectedDistricts(vals);
    else if (filterMode === 'State-wise') setSelectedStates(vals);
    else if (filterMode === 'Place-wise') setSelectedPlaces(vals);
    else if (filterMode === 'Individual Property') setSelectedProperties(vals);
  };

  const handlePropertyClick = (prop: typeof dummyProps[0]) => {
    setCurrentProperty(allProperties.find(p => p.id === prop.id) || prop);
    navigate(`/property/${prop.id}/dashboard`);
  };

  const activeTags = [];
  if (appliedFilters.selectedDateRange.from === appliedFilters.selectedDateRange.to && appliedFilters.selectedDateRange.from) activeTags.push(`Date: ${appliedFilters.selectedDateRange.from}`);
  else if (appliedFilters.selectedDateRange.from || appliedFilters.selectedDateRange.to) activeTags.push(`Date: ${appliedFilters.selectedDateRange.from || 'Any'} to ${appliedFilters.selectedDateRange.to || 'Any'}`);
  if (appliedFilters.filterMode === 'District-wise' && appliedFilters.selectedDistricts.length) activeTags.push(`Districts: ${appliedFilters.selectedDistricts.join(', ')}`);
  if (appliedFilters.filterMode === 'State-wise' && appliedFilters.selectedStates.length) activeTags.push(`States: ${appliedFilters.selectedStates.join(', ')}`);
  if (appliedFilters.filterMode === 'Place-wise' && appliedFilters.selectedPlaces.length) activeTags.push(`Places: ${appliedFilters.selectedPlaces.join(', ')}`);
  if (appliedFilters.filterMode === 'Individual Property' && appliedFilters.selectedProperties.length) activeTags.push(`${appliedFilters.selectedProperties.length} Selected`);

  appliedFilters.selectedAmenities.forEach(a => activeTags.push(`Amenity: ${a}`));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Global Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview across filtered properties</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => navigate('/property/all/dashboard')}>
            Consolidated Analytics
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => { setInitialDate(undefined); setShowNewBooking(true); }}>
            New Booking
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6 relative z-10 transition-all hover:shadow-md">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-end">

          {/* Date Column */}
          <div className="flex-[3] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Period</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer group">
                  <input type="radio" checked={dateMode === 'Range'} onChange={() => setDateMode('Range')} className="accent-primary w-3.5 h-3.5" />
                  <span className="group-hover:text-primary transition-colors">Range</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer group">
                  <input type="radio" checked={dateMode === 'Single'} onChange={() => { setDateMode('Single'); setSelectedDateRange({ from: selectedDateRange.from, to: selectedDateRange.from }); }} className="accent-primary w-3.5 h-3.5" />
                  <span className="group-hover:text-primary transition-colors">Single Day</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dateMode === 'Range' ? (
                <>
                  <div className="relative">
                    <Input
                      type="date"
                      value={selectedDateRange.from || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setSelectedDateRange(prev => ({ ...prev, from: val }));
                      }}
                      className="h-11 px-4 text-sm font-medium border-slate-200 focus:border-primary/50 transition-all w-full bg-white"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="date"
                      value={selectedDateRange.to || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setSelectedDateRange(prev => ({ ...prev, to: val }));
                      }}
                      className="h-11 px-4 text-sm font-medium border-slate-200 focus:border-primary/50 transition-all w-full bg-white"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={selectedDateRange.from || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedDateRange({ from: val, to: val });
                    }}
                    className="h-11 px-4 text-sm font-medium border-slate-200 focus:border-primary/50 transition-all w-full bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location Mode Column */}
          <div className="flex-[3] flex flex-col gap-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grouping Mode</label>
            <select
              value={filterMode}
              onChange={e => {
                setFilterMode(e.target.value);
                setSelectedDistricts([]);
                setSelectedStates([]);
                setSelectedPlaces([]);
                setSelectedProperties([]);
              }}
              className="flex h-11 w-full rounded-md border border-slate-200 bg-background px-4 py-2 text-sm font-medium ring-offset-background cursor-pointer hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            >
              <option value="All Properties">All Properties</option>
              <option value="District-wise">District-wise</option>
              <option value="State-wise">State-wise</option>
              <option value="Place-wise">Place-wise</option>
              <option value="Individual Property">Individual Property</option>
            </select>
          </div>

          {/* Multi-Select Column */}
          <div className="flex-[4] flex flex-col gap-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selection Filters</label>
            <MultiSelectDropdown
              options={locationOptions}
              selected={selectedLocationValues}
              onChange={handleLocationChange}
              placeholder={filterMode === 'All Properties' ? 'All Global Data Included' : `Select ${filterMode.split('-')[0]}s`}
              disabled={filterMode === 'All Properties'}
            />
          </div>

          {/* Amenities Column */}
          <div className="flex-[3] flex flex-col gap-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amenities</label>
            <MultiSelectDropdown
              options={[
                { value: 'Hotel + Restaurant', label: 'Hotel + Restaurant' },
                { value: 'Swimming Pool', label: 'Swimming Pool' },
                { value: 'Playzone', label: 'Playzone' }
              ]}
              selected={selectedAmenities}
              onChange={setSelectedAmenities}
              placeholder="Select Amenities"
            />
          </div>

          {/* Actions Column */}
          <div className="flex-[2] flex gap-3 h-11 items-center">
            <Button className="bg-primary hover:bg-primary/90 text-white flex-1 h-full font-bold shadow-sm rounded-lg tracking-wide border-b-2 border-primary-foreground/20 active:border-b-0 active:translate-y-0.5 transition-all" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50 h-full w-12 p-0 flex items-center justify-center rounded-lg shadow-sm" title="Clear Filters" onClick={clearFilters}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {activeTags.length > 0 ? activeTags.map(tag => (
              <Badge key={tag} className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">{tag}</Badge>
            )) : <span className="text-xs text-muted-foreground italic">No active filters applied</span>}
          </div>
        </div>
      </div>

      {processedData.length === 0 ? (
        <div className="bg-card border rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <MapPin className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">No Data Available for Selected Filters</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">Try adjusting your date range, clearing some advanced filters, or selecting different locations.</p>
          <Button variant="outline" className="mt-6 text-red-600 border-red-200 hover:bg-red-50" onClick={clearFilters}>Clear All Filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Resorts" value={stats.totalProperties} icon={Building2} />
            <DashboardCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} />
            <DashboardCard title="Total Bookings" value={stats.totalBookings} icon={BookOpen} />
            <DashboardCard title="Check-ins" value={stats.todayCheckIns} icon={CalendarCheck} variant="success" />
            <DashboardCard title="Check-outs" value={stats.todayCheckOuts} icon={CalendarMinus} variant="warning" />
            <DashboardCard title="Occupancy" value={`${stats.occupancyPercentage}%`} icon={Percent} variant={stats.occupancyPercentage > 70 ? 'destructive' : 'success'} />
            <DashboardCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} variant="success" />
            <DashboardCard title="Expenses" value={`₹${stats.totalExpenses.toLocaleString()}`} icon={Wallet} variant="destructive" />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Haritha Resorts Overview</h2>
                <p className="text-sm text-muted-foreground">
                  {!appliedFilters.selectedDateRange.from && !appliedFilters.selectedDateRange.to
                    ? "Overall Status and Availability"
                    : `Showing status and availability for ${appliedFilters.selectedDateRange.from === appliedFilters.selectedDateRange.to ? appliedFilters.selectedDateRange.from : `${appliedFilters.selectedDateRange.from} to ${appliedFilters.selectedDateRange.to}`}`}
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                {processedData.length} Properties Found
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {processedData.map(prop => {
                const fStart = appliedFilters.selectedDateRange.from;
                const fEnd = appliedFilters.selectedDateRange.to;

                const stats = getPropertyStats(prop, fStart, fEnd);
                const { bookCount, maintCount, blockCount, available: availCount, totalRooms: totalRms } = stats;



                return (
                  <div
                    key={prop.id}
                    onClick={() => handlePropertyClick(prop)}
                    className="bg-card rounded-xl border card-shadow p-5 cursor-pointer hover:card-shadow-lg hover:border-primary/40 transition-all group flex flex-col justify-between ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex items-start gap-2 pr-2">
                          <img src="/Haritha_logo.svg" alt="Haritha Logo" className="h-6 w-6 mt-0.5 object-contain shrink-0" />
                          <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                            {prop.name}
                          </h3>
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] whitespace-nowrap">
                          {totalRms} Rooms
                        </Badge>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-4">
                        <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                        <span className="leading-snug">{prop.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {prop.hasRestaurant && <Badge className="bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100 text-[9px] px-2 py-0">Restaurant</Badge>}
                        {prop.hasPool && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 text-[9px] px-2 py-0">Pool</Badge>}
                        {prop.hasPlayzone && <Badge className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 text-[9px] px-2 py-0">Playzone</Badge>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                          <span className="text-slate-600 font-bold text-sm tracking-tight">{availCount}</span>
                          <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest mt-0.5">Avail</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-green-50/80 border border-green-100">
                          <span className="text-green-600 font-bold text-sm tracking-tight">{bookCount}</span>
                          <span className="text-[8px] text-green-700 font-bold uppercase tracking-widest mt-0.5">Book</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-blocked/10 border border-blocked/20">
                          <span className="text-blocked font-bold text-sm tracking-tight">{blockCount}</span>
                          <span className="text-[8px] text-blocked font-bold uppercase tracking-widest mt-0.5">Block</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-saffron/10 border border-saffron/20">
                          <span className="text-saffron font-bold text-sm tracking-tight">{maintCount}</span>
                          <span className="text-[8px] text-saffron font-bold uppercase tracking-widest mt-0.5">Maint</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full h-9 text-xs font-bold shadow-sm rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInitialDate(appliedFilters.selectedDateRange.from || new Date().toISOString().split('T')[0]);
                          setBookingPropId(prop.id);
                          setShowNewBooking(true);
                        }}
                      >
                        Quick Book
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showNewBooking && (
        <BookingFormModal open={showNewBooking} onClose={() => { setShowNewBooking(false); setBookingPropId(undefined); }} initialDate={initialDate} fixedPropertyId={bookingPropId} />
      )}
    </div>
  );
}
