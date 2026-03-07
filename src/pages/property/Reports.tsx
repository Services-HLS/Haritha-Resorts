import { useState, useMemo } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, Download, BedDouble, PartyPopper, BarChart3,
  Wallet, CreditCard, IndianRupee, TrendingUp, TrendingDown,
  DollarSign, UserCheck, Ban, PieChart, Shield, CalendarDays, Filter,
  FileSpreadsheet
} from 'lucide-react';

type SummaryTab = 'Rooms' | 'Functions' | 'Expenses';
type ReportTab = 'Daily Occupancy' | 'Daily Sales' | 'Check In/Out' | 'Blocking' | 'Expenses (Excl. Salaries)' | 'Salaries' | 'P&L Summary' | 'Police Report' | 'Function Room';

export default function Reports() {
  const { currentProperty } = useProperty();

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [summaryTab, setSummaryTab] = useState<SummaryTab>('Rooms');
  const [reportTab, setReportTab] = useState<ReportTab>('Daily Occupancy');

  const [sumStartDate, setSumStartDate] = useState(firstDayStr);
  const [sumEndDate, setSumEndDate] = useState(todayStr);

  const [repStartDate, setRepStartDate] = useState(firstDayStr);
  const [repEndDate, setRepEndDate] = useState(todayStr);
  const [repSingleDate, setRepSingleDate] = useState(todayStr);

  if (!currentProperty) return null;

  // Real calculations based on current property mock data
  const summaryMetrics = useMemo(() => {
    let roomCash = 0;
    let roomOnline = 0;

    currentProperty.bookings.forEach(b => {
      const date = b.bookingDate || b.checkIn;
      if (date >= sumStartDate && date <= sumEndDate && !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)) {
        const amt = b.paidAmount || (b.paymentStatus === 'Paid' ? b.totalAmount : 0);
        // Simulate a mix of cash and online if not strictly defined
        if (b.paymentType === 'Cash' || (!b.paymentType && Math.random() < 0.3)) {
          roomCash += amt;
        } else {
          roomOnline += amt;
        }
      }
    });

    let expExcl = 0;
    let salaries = 0;
    (currentProperty.expenses || []).forEach(e => {
      if (e.date >= sumStartDate && e.date <= sumEndDate) {
        if (e.category === 'Staff Salary') {
          salaries += e.amount;
        } else {
          expExcl += e.amount;
        }
      }
    });

    const roomTotal = roomCash + roomOnline;
    const totExpenses = expExcl + salaries;

    return {
      roomCash, roomOnline, roomTotal,
      funcCash: 0, funcOnline: 0, funcTotal: 0,
      totalCash: roomCash, totalOnline: roomOnline, totalCollections: roomTotal,
      expExcl, salaries, totExpenses,
      netProfit: roomTotal - totExpenses
    };
  }, [currentProperty, sumStartDate, sumEndDate]);

  const occRecords = useMemo(() => {
    const records = [];
    let startObj = new Date(repStartDate);
    let endObj = new Date(repEndDate);
    if (startObj > endObj) return [];

    const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const limit = Math.min(diffDays + 1, 31);

    const totalRooms = currentProperty.rooms.length;

    for (let i = 0; i < limit; i++) {
      let currentD = new Date(startObj.getTime() + (i * 86400000));
      let currStr = currentD.toISOString().split('T')[0];

      let occupied = 0;
      let maint = 0;

      currentProperty.bookings.forEach(b => {
        if (currStr >= b.checkIn && currStr < b.checkOut) {
          if (b.status === 'Maintenance') maint++;
          else if (b.status !== 'Cancelled' && b.status !== 'Blocked') occupied++;
        }
      });

      let rate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(2) : '0.00';
      records.push({
        date: currStr.split('-').reverse().join('/'),
        totalRooms: totalRooms.toFixed(2),
        occupied: occupied.toFixed(2),
        maint: maint.toFixed(2),
        rate: rate,
        percentage: `${rate}%`
      });
    }
    return records;
  }, [currentProperty, repStartDate, repEndDate]);

  const salesRecords = useMemo(() => {
    const records: any[] = [];
    const gstRate = currentProperty.taxPercentage || 12;

    currentProperty.bookings.forEach(b => {
      const date = b.bookingDate || b.checkIn;
      if (date === repSingleDate && !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)) {
        const baseCost = (b.totalAmount / (1 + (gstRate / 100)));
        const gst = b.totalAmount - baseCost;
        records.push({
          date: date.split('-').reverse().join('/'),
          room: b.roomNumber,
          customer: b.guestName,
          mobile: b.guestPhone || 'N/A',
          method: b.paymentType || 'Online',
          cost: baseCost.toFixed(2),
          gst: gst.toFixed(2),
          total: b.totalAmount.toFixed(2)
        });
      }
    });
    return records;
  }, [currentProperty, repSingleDate]);

  const checkInOutRecords = useMemo(() => {
    const records: any[] = [];
    currentProperty.bookings.forEach(b => {
      if ((b.checkIn >= repStartDate && b.checkIn <= repEndDate) || (b.checkOut >= repStartDate && b.checkOut <= repEndDate)) {
        if (!['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)) {
          const baseCost = (b.totalAmount / (1 + ((currentProperty.taxPercentage || 12) / 100)));
          const gst = b.totalAmount - baseCost;
          records.push({
            inDate: b.checkIn.split('-').reverse().join('/'),
            outDate: b.checkOut.split('-').reverse().join('/'),
            room: b.roomNumber,
            customer: b.guestName,
            mobile: b.guestPhone || 'N/A',
            persons: (b.adults || 2).toFixed(2),
            cost: baseCost.toFixed(2),
            gst: gst.toFixed(2),
            total: b.totalAmount.toFixed(2)
          });
        }
      }
    });
    return records.sort((a, b) => a.inDate.localeCompare(b.inDate));
  }, [currentProperty, repStartDate, repEndDate]);

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;


  return (
    <div className="space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Reports Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and analyze hotel performance reports</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-10 px-4 shadow-sm bg-background flex-1 md:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button className="h-10 px-4 shadow-sm flex-1 md:flex-none">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* SUMMARY DASHBOARD BOX */}
      <div className="bg-card rounded-xl border card-shadow p-4 sm:p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground">Summary Dashboard</h2>
          <p className="text-xs text-muted-foreground">Key performance indicators including room and function bookings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Start Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="date" value={sumStartDate} onChange={e => setSumStartDate(e.target.value)} className="pl-9 h-11" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">End Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="date" value={sumEndDate} onChange={e => setSumEndDate(e.target.value)} className="pl-9 h-11" />
            </div>
          </div>
        </div>

        {/* PILLS */}
        <div className="flex flex-wrap gap-2 mb-6 border-t pt-4">
          <button
            onClick={() => setSummaryTab('Rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm ${summaryTab === 'Rooms' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground hover:bg-muted'}`}
          >
            <BedDouble className="h-4 w-4" /> Rooms
          </button>
          <button
            onClick={() => setSummaryTab('Functions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm ${summaryTab === 'Functions' ? 'bg-orange-500 text-white border-orange-500' : 'bg-background text-foreground hover:bg-muted'}`}
          >
            <PartyPopper className="h-4 w-4" /> Functions
          </button>
          <button
            onClick={() => setSummaryTab('Expenses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm ${summaryTab === 'Expenses' ? 'bg-red-500 text-white border-red-500' : 'bg-background text-foreground hover:bg-muted'}`}
          >
            <BarChart3 className="h-4 w-4" /> Expenses
          </button>
        </div>

        {/* SUMMARY CARDS DYNAMIC */}
        {summaryTab === 'Rooms' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-l-4 border-l-emerald-500 bg-background flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Room Cash</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.roomCash)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-l-4 border-l-blue-500 bg-background flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Room Online</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.roomOnline)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-l-4 border-l-purple-500 bg-background flex justify-between items-center shadow-sm sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Room Total</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.roomTotal)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {summaryTab === 'Functions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Same functional layout as rooms but styled for functions */}
            <div className="p-5 rounded-xl border border-l-4 border-l-orange-500 bg-background flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Function Cash</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.funcCash)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-l-4 border-l-sky-500 bg-background flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Function Online</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.funcOnline)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-l-4 border-l-indigo-500 bg-background flex justify-between items-center shadow-sm sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Function Total</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.funcTotal)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {summaryTab === 'Expenses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-l-4 border-l-rose-500 bg-background flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Expenses (Excl. Salaries)</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.expExcl)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-l-4 border-l-amber-500 bg-background flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Salaries</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.salaries)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-l-4 border-l-pink-500 bg-background flex justify-between items-center shadow-sm sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Total Expenses</p>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(summaryMetrics.totExpenses)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-5 rounded-xl border border-l-4 border-l-red-500 bg-background flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-4">
              <div className="flex-1">
                <p className="text-sm font-extrabold text-foreground mb-1">Net Profit / Loss</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Total Collections (Room + Function) - Total Expenses<br />
                  Room: {formatCurrency(summaryMetrics.roomTotal)} | Function: ₹0 | Total: {formatCurrency(summaryMetrics.totalCollections)}<br />
                </p>
              </div>
              <div className="text-left md:text-right w-full md:w-auto p-4 md:p-0 bg-muted/30 md:bg-transparent rounded-lg">
                <p className={`text-3xl font-black mb-1 ${summaryMetrics.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(Math.abs(summaryMetrics.netProfit))} {summaryMetrics.netProfit >= 0 ? '(Profit)' : '(Loss)'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Total Expenses: {formatCurrency(summaryMetrics.totExpenses)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MID SCROLLABLE TABS */}
      <div className="bg-card p-2 rounded-xl flex overflow-x-auto hide-scrollbar gap-2 border shadow-sm items-center">
        {[
          { label: 'Daily Occupancy', icon: BedDouble },
          { label: 'Daily Sales', icon: DollarSign },
          { label: 'Check In/Out', icon: UserCheck },
          { label: 'Blocking', icon: Ban },
          { label: 'Expenses (Excl. Salaries)', icon: BarChart3 },
          { label: 'Salaries', icon: TrendingUp },
          { label: 'P&L Summary', icon: PieChart },
          { label: 'Police Report', icon: Shield },
          { label: 'Function Room', icon: PartyPopper },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setReportTab(tab.label as ReportTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap shrink-0 ${reportTab === tab.label
              ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
              : 'text-foreground hover:bg-muted'
              }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT SPECIFIC SECTION */}

      {/* DAILY OCCUPANCY REPORT */}
      {reportTab === 'Daily Occupancy' && (
        <div className="space-y-0 shadow-sm border rounded-xl overflow-hidden bg-card card-shadow mt-6">
          <div className="p-5 md:p-6 border-b flex items-center gap-3 bg-muted/20">
            <div className="h-10 w-10 flex border items-center justify-center rounded-lg bg-background shadow-xs text-primary">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Daily Occupancy Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily room occupancy, revenue, and availability statistics</p>
            </div>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border-b bg-muted/5">
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repStartDate} onChange={e => setRepStartDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repEndDate} onChange={e => setRepEndDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Button className="w-full h-11 shadow-sm font-bold">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-foreground">Report Data</h4>
                <Badge variant="secondary" className="font-semibold rounded-md px-2.5 py-0.5">{occRecords.length} records</Badge>
              </div>
              <Button variant="outline" className="h-9 px-4 text-xs font-bold shadow-sm">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Export Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-foreground font-bold border-b">
                  <tr>
                    <th className="px-5 py-4 whitespace-nowrap">Date</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Total Rooms</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Occupied Rooms</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Maintenance Rooms</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Occupancy Rate</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Occupancy Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-muted-foreground bg-background">
                  {occRecords.length > 0 ? occRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">{r.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.totalRooms}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.occupied}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.maint}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.rate}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{r.percentage}</Badge>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground bg-muted/20">No data found for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DAILY SALES REPORT */}
      {reportTab === 'Daily Sales' && (
        <div className="space-y-0 shadow-sm border rounded-xl overflow-hidden bg-card card-shadow mt-6">
          <div className="p-5 md:p-6 border-b flex items-center gap-3 bg-muted/20">
            <div className="h-10 w-10 flex border items-center justify-center rounded-lg bg-background shadow-xs text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Daily Sales Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily booking sales with customer and payment details</p>
            </div>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end border-b bg-muted/5">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Select Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repSingleDate} onChange={e => setRepSingleDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="md:col-span-1 lg:col-span-1">
              <Button className="w-full h-11 shadow-sm font-bold">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-foreground">Report Data</h4>
                <Badge variant="secondary" className="font-semibold rounded-md px-2.5 py-0.5">{salesRecords.length} records</Badge>
              </div>
              <Button variant="outline" className="h-9 px-4 text-xs font-bold shadow-sm">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Export Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-foreground font-bold border-b">
                  <tr>
                    <th className="px-5 py-4 whitespace-nowrap">Date</th>
                    <th className="px-5 py-4 whitespace-nowrap">Room Number</th>
                    <th className="px-5 py-4 whitespace-nowrap">Customer Name</th>
                    <th className="px-5 py-4 whitespace-nowrap">Mobile No</th>
                    <th className="px-5 py-4 whitespace-nowrap text-center">Payment Method</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Room Cost</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Gst</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-muted-foreground bg-background">
                  {salesRecords.length > 0 ? salesRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">{r.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{r.room}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{r.customer}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{r.mobile}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center text-xs uppercase tracking-wider font-bold">{r.method}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.cost}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.gst}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-foreground font-bold">{r.total}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground bg-muted/20">No data found for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHECK IN OUT REPORT */}
      {reportTab === 'Check In/Out' && (
        <div className="space-y-0 shadow-sm border rounded-xl overflow-hidden bg-card card-shadow mt-6">
          <div className="p-5 md:p-6 border-b flex items-center gap-3 bg-muted/20">
            <div className="h-10 w-10 flex border items-center justify-center rounded-lg bg-background shadow-xs text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Check In & Check Out Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Check-in and check-out schedule for guests</p>
            </div>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border-b bg-muted/5">
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repStartDate} onChange={e => setRepStartDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repEndDate} onChange={e => setRepEndDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Button className="w-full h-11 shadow-sm font-bold">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-foreground">Report Data</h4>
                <Badge variant="secondary" className="font-semibold rounded-md px-2.5 py-0.5">{checkInOutRecords.length} records</Badge>
              </div>
              <Button variant="outline" className="h-9 px-4 text-xs font-bold shadow-sm">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Export Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-foreground font-bold border-b">
                  <tr>
                    <th className="px-5 py-4 whitespace-nowrap">Check In Date</th>
                    <th className="px-5 py-4 whitespace-nowrap">Check Out Date</th>
                    <th className="px-5 py-4 whitespace-nowrap">Room Number</th>
                    <th className="px-5 py-4 whitespace-nowrap">Customer Name</th>
                    <th className="px-5 py-4 whitespace-nowrap">Mobile No</th>
                    <th className="px-5 py-4 whitespace-nowrap text-center">Persons</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Room Cost</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Gst</th>
                    <th className="px-5 py-4 whitespace-nowrap text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-muted-foreground bg-background">
                  {checkInOutRecords.length > 0 ? checkInOutRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">{r.inDate}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">{r.outDate}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{r.room}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{r.customer}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{r.mobile}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">{r.persons}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.cost}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">{r.gst}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-foreground font-bold">{r.total}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground bg-muted/20">No data found for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS MOCKUPS */}
      {!['Daily Occupancy', 'Daily Sales', 'Check In/Out'].includes(reportTab) && (
        <div className="space-y-0 shadow-sm border rounded-xl overflow-hidden bg-card card-shadow mt-6">
          <div className="p-5 md:p-6 border-b flex items-center gap-3 bg-muted/20">
            <div className="h-10 w-10 flex border items-center justify-center rounded-lg bg-background shadow-xs text-primary">
              {reportTab === 'Blocking' && <Ban className="h-5 w-5" />}
              {reportTab === 'Expenses (Excl. Salaries)' && <BarChart3 className="h-5 w-5" />}
              {reportTab === 'Salaries' && <TrendingUp className="h-5 w-5" />}
              {reportTab === 'P&L Summary' && <PieChart className="h-5 w-5" />}
              {reportTab === 'Police Report' && <Shield className="h-5 w-5" />}
              {reportTab === 'Function Room' && <PartyPopper className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{reportTab} Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Detailed view for {reportTab.toLowerCase()} records</p>
            </div>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border-b bg-muted/5">
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repStartDate} onChange={e => setRepStartDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={repEndDate} onChange={e => setRepEndDate(e.target.value)} className="pl-9 h-11" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Button className="w-full h-11 shadow-sm font-bold">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-foreground">Report Data</h4>
                <Badge variant="secondary" className="font-semibold rounded-md px-2.5 py-0.5">
                  {reportTab === 'Blocking' ? '3' : reportTab === 'P&L Summary' ? '12' : reportTab === 'Function Room' ? '4' : '8'} records
                </Badge>
              </div>
              <Button variant="outline" className="h-9 px-4 text-xs font-bold shadow-sm">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Export Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-foreground font-bold border-b">
                  <tr>
                    {reportTab === 'Blocking' && (
                      <>
                        <th className="px-5 py-4 whitespace-nowrap">Date</th>
                        <th className="px-5 py-4 whitespace-nowrap">Room Number</th>
                        <th className="px-5 py-4 whitespace-nowrap">Reason</th>
                        <th className="px-5 py-4 whitespace-nowrap">Blocked By</th>
                        <th className="px-5 py-4 whitespace-nowrap">Status</th>
                      </>
                    )}
                    {reportTab === 'Expenses (Excl. Salaries)' && (
                      <>
                        <th className="px-5 py-4 whitespace-nowrap">Date</th>
                        <th className="px-5 py-4 whitespace-nowrap">Category</th>
                        <th className="px-5 py-4 whitespace-nowrap">Description</th>
                        <th className="px-5 py-4 whitespace-nowrap text-right">Amount</th>
                      </>
                    )}
                    {reportTab === 'Salaries' && (
                      <>
                        <th className="px-5 py-4 whitespace-nowrap">Date</th>
                        <th className="px-5 py-4 whitespace-nowrap">Employee</th>
                        <th className="px-5 py-4 whitespace-nowrap">Role</th>
                        <th className="px-5 py-4 whitespace-nowrap text-right">Net Pay</th>
                      </>
                    )}
                    {reportTab === 'P&L Summary' && (
                      <>
                        <th className="px-5 py-4 whitespace-nowrap">Month</th>
                        <th className="px-5 py-4 whitespace-nowrap text-right">Revenue</th>
                        <th className="px-5 py-4 whitespace-nowrap text-right">Expenses</th>
                        <th className="px-5 py-4 whitespace-nowrap text-right">Net Profit</th>
                      </>
                    )}
                    {reportTab === 'Police Report' && (
                      <>
                        <th className="px-5 py-4 whitespace-nowrap">Date</th>
                        <th className="px-5 py-4 whitespace-nowrap">Guest Name</th>
                        <th className="px-5 py-4 whitespace-nowrap">ID Type</th>
                        <th className="px-5 py-4 whitespace-nowrap">ID Number</th>
                        <th className="px-5 py-4 whitespace-nowrap">Room</th>
                      </>
                    )}
                    {reportTab === 'Function Room' && (
                      <>
                        <th className="px-5 py-4 whitespace-nowrap">Date</th>
                        <th className="px-5 py-4 whitespace-nowrap">Event Type</th>
                        <th className="px-5 py-4 whitespace-nowrap">Customer</th>
                        <th className="px-5 py-4 whitespace-nowrap text-right">Total Amount</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-muted-foreground bg-background">
                  {/* GENERATING GENERIC MOCK ROWS BASED ON TAB */}
                  {[...Array(reportTab === 'Blocking' ? 2 : reportTab === 'P&L Summary' ? 4 : 5)].map((_, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      {reportTab === 'Blocking' && (
                        <>
                          <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">28/02/2026</td>
                          <td className="px-5 py-4 whitespace-nowrap">10{i + 1}</td>
                          <td className="px-5 py-4 whitespace-nowrap">Deep Cleaning</td>
                          <td className="px-5 py-4 whitespace-nowrap">Admin</td>
                          <td className="px-5 py-4 whitespace-nowrap"><Badge variant="destructive">Blocked</Badge></td>
                        </>
                      )}
                      {reportTab === 'Expenses (Excl. Salaries)' && (
                        <>
                          <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">27/02/2026</td>
                          <td className="px-5 py-4 whitespace-nowrap">Maintenance</td>
                          <td className="px-5 py-4 whitespace-nowrap">Plumbing repairs in Room 205</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-foreground font-bold">₹ {2500 + i * 500}</td>
                        </>
                      )}
                      {reportTab === 'Salaries' && (
                        <>
                          <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">01/03/2026</td>
                          <td className="px-5 py-4 whitespace-nowrap">Employee #{i + 1}</td>
                          <td className="px-5 py-4 whitespace-nowrap">{i === 0 ? 'Manager' : 'Housekeeping'}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-foreground font-bold">₹ {15000 + i * 2000}</td>
                        </>
                      )}
                      {reportTab === 'P&L Summary' && (
                        <>
                          <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">March 2026</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-emerald-600 font-bold">₹ 1,50,000</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-rose-600 font-bold">₹ 80,000</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-foreground font-bold">₹ 70,000</td>
                        </>
                      )}
                      {reportTab === 'Police Report' && (
                        <>
                          <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">28/02/2026</td>
                          <td className="px-5 py-4 whitespace-nowrap">Guest {i + 1}</td>
                          <td className="px-5 py-4 whitespace-nowrap">Aadhar Card</td>
                          <td className="px-5 py-4 whitespace-nowrap font-mono">{432109876543 + i}</td>
                          <td className="px-5 py-4 whitespace-nowrap">20{i + 1}</td>
                        </>
                      )}
                      {reportTab === 'Function Room' && (
                        <>
                          <td className="px-5 py-4 whitespace-nowrap text-foreground font-semibold">15/03/2026</td>
                          <td className="px-5 py-4 whitespace-nowrap">{i % 2 === 0 ? 'Wedding Reception' : 'Corporate Event'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">Customer {i + 1}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-foreground font-bold">₹ {i % 2 === 0 ? 80000 : 45000}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
