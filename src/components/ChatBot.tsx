import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useProperty } from '@/contexts/PropertyContext';
import { getPropertyStats } from '@/data/mockData';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function ChatBot() {
    const { user } = useAuth();
    const { allProperties } = useProperty();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello ${user?.name || ''}! I am your HMS Assistant. Logged in as: ${user?.name}. ${user?.role === 'Super Admin' ? 'You have full global access.' : 'You have access to ' + user?.name + ' data only.'} Try asking about "revenue", "bookings", or "help".`,
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter properties based on role
    const allowedProperties = user?.role === 'Super Admin'
        ? allProperties
        : allProperties.filter(p => p.id === user?.propertyId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');

        // Simple bot response simulation
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(message),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    const getBotResponse = (input: string) => {
        const lowInput = input.toLowerCase();

        // 1. Core Config & Dates
        const todayStr = new Date().toISOString().split('T')[0];
        let fStart = todayStr;
        let fEnd = todayStr;

        try {
            const dashFilters = localStorage.getItem('hms_dashboard_filters');
            if (dashFilters) {
                const parsed = JSON.parse(dashFilters);
                if (parsed.selectedDateRange) {
                    fStart = parsed.selectedDateRange.from || '1970-01-01';
                    fEnd = parsed.selectedDateRange.to || todayStr;
                }
            }
        } catch (e) { }

        // Date Overrides
        const isTotalRequested = lowInput.includes('total') || lowInput.includes('all time') || lowInput.includes('overall');
        const isGlobalRequested = lowInput.includes('network') || lowInput.includes('all resorts') || lowInput.includes('global') || lowInput.includes('everywhere');
        const isTodayRequested = lowInput.includes('today');
        const isYesterdayRequested = lowInput.includes('yesterday');

        const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
        const foundDates = lowInput.match(dateRegex);
        let contextDateMsg = '';

        if (foundDates) {
            if (foundDates.length === 1) { fStart = foundDates[0]; fEnd = foundDates[0]; contextDateMsg = `for ${fStart}`; }
            else if (foundDates.length >= 2) {
                fStart = foundDates[0] < foundDates[1] ? foundDates[0] : foundDates[1];
                fEnd = foundDates[0] > foundDates[1] ? foundDates[0] : foundDates[1];
                contextDateMsg = `between ${fStart} and ${fEnd}`;
            }
        } else if (isTodayRequested) { fStart = todayStr; fEnd = todayStr; contextDateMsg = "for today"; }
        else if (isYesterdayRequested) {
            const yest = new Date(); yest.setDate(yest.getDate() - 1);
            fStart = yest.toISOString().split('T')[0]; fEnd = fStart; contextDateMsg = "for yesterday";
        } else {
            // If neither the prompt contains dates nor the dashboard has a filter, default to ALL TIME for better answers
            if (!fStart || isTotalRequested) {
                fStart = '';
                fEnd = '';
                contextDateMsg = "of all-time";
            } else {
                contextDateMsg = fStart === fEnd ? `for ${fStart}` : `between ${fStart} and ${fEnd}`;
            }
        }

        // 2. Identify Target (Property, District, Place)
        let targetProperty: any = undefined;
        let targetDistrict: string = '';
        let targetPlace: string = '';

        // Extract metadata
        const propertyMeta = allProperties.map(p => {
            const parts = p.location.split(', ').map(s => s.trim());
            return {
                id: p.id,
                name: p.name.toLowerCase(),
                place: parts[0].toLowerCase(),
                district: (parts.length > 1 ? parts[1] : parts[0]).toLowerCase()
            };
        });

        const mentionedProp = propertyMeta.find(m => lowInput.includes(m.name));
        const mentionedDistrict = Array.from(new Set(propertyMeta.map(m => m.district))).find(d => lowInput.includes(d));
        const mentionedPlace = Array.from(new Set(propertyMeta.map(m => m.place))).find(p => lowInput.includes(p));

        // 3. Robust RBAC Check
        const isAdmin = user?.role === 'Super Admin';
        const userPropId = user?.propertyId;
        const userProp = propertyMeta.find(m => m.id === userPropId);

        if (!isAdmin) {
            // Non-admins can only ask about their own property/district/place relative to their resort
            if (mentionedProp && mentionedProp.id !== userPropId) {
                return `Access Denied: You cannot see others' data. You only have access to view details for ${userProp?.name.toUpperCase()}.`;
            }
            if (mentionedDistrict && mentionedDistrict !== userProp?.district) {
                return `Access Denied: You cannot see data for ${mentionedDistrict.toUpperCase()} district. Your access is restricted to your property in ${userProp?.district.toUpperCase()}.`;
            }
            if (mentionedPlace && mentionedPlace !== userProp?.place) {
                return `Access Denied: You cannot see data for ${mentionedPlace.toUpperCase()}. Your access is restricted to your property in ${userProp?.place.toUpperCase()}.`;
            }
            if (isGlobalRequested || (isTotalRequested && !mentionedProp && !mentionedDistrict && !mentionedPlace)) {
                return `Access Denied: Only Administrators can access global network data. You can ask for stats related to your resort.`;
            }
        }

        // 4. Data Retrieval Helper (Unified with Dashboard)
        const getUnifiedStats = (props: any[]) => {
            let rev = 0, bks = 0, rooms = 0, maint = 0;
            props.forEach(p => {
                const s = getPropertyStats(p, fStart === '1970-01-01' ? '' : fStart, fStart === '1970-01-01' ? '' : fEnd);
                rev += s.revenue;
                bks += s.todayBookings;
                rooms += s.totalRooms;
                maint += (s.maintCount || 0);
            });
            return { rev, bks, rooms, maint };
        };

        const formatMoney = (val: number) => Math.abs(val) > 99999 ? (val / 1000).toFixed(1) + 'K' : val.toLocaleString();

        // 5. Generate Response
        const isRevenue = lowInput.includes('revenue') || lowInput.includes('money') || lowInput.includes('earn') || lowInput.includes('sale') || lowInput.includes('income') || lowInput.includes('profit') || lowInput.includes('collection') || lowInput.includes('billing');
        const isBooking = lowInput.includes('booking') || lowInput.includes('reservation') || lowInput.includes('stay') || lowInput.includes('occupancy') || lowInput.includes('check') || lowInput.includes('guest') || lowInput.includes('resv');
        const isRooms = lowInput.includes('room') || lowInput.includes('capacity') || lowInput.includes('bed') || lowInput.includes('inventory');
        const isMaintenance = lowInput.includes('maintenance') || lowInput.includes('repair') || lowInput.includes('fix') || lowInput.includes('blocked');

        if (lowInput.includes('hello') || lowInput.includes('hi')) return `Hi ${user?.name || 'there'}! Ask me about revenue, bookings, or room capacity for any property.`;
        if (lowInput.includes('help')) return `Try Queries like: "total revenue", "bookings in Araku today", or "Rushikonda rooms".`;

        if (mentionedProp) {
            const p = allProperties.find(x => x.id === mentionedProp.id)!;
            const s = getUnifiedStats([p]);
            if (isRevenue) return `The revenue for ${p.name} ${contextDateMsg} is ₹${formatMoney(s.rev)}.`;
            if (isBooking) return `${p.name} has ${s.bks} total bookings ${contextDateMsg}.`;
            if (isRooms) return `${p.name} operates ${s.rooms} rooms in total.`;
            if (isMaintenance) return `There are ${s.maint} rooms currently under maintenance/blocked at ${p.name}.`;
            return `Data for ${p.name}: ${s.rooms} rooms, ${s.bks} bookings ${contextDateMsg}, and ₹${formatMoney(s.rev)} revenue.`;
        }

        if (mentionedDistrict && isAdmin) {
            const dProps = allProperties.filter(p => p.location.toLowerCase().includes(mentionedDistrict));
            const s = getUnifiedStats(dProps);
            if (isRevenue) return `The total revenue for ${mentionedDistrict.toUpperCase()} district ${contextDateMsg} is ₹${formatMoney(s.rev)}.`;
            return `Summary for ${mentionedDistrict.toUpperCase()}: ${dProps.length} properties, ${s.bks} bookings, and ₹${formatMoney(s.rev)} revenue ${contextDateMsg}.`;
        }

        if (mentionedPlace && isAdmin) {
            const pProps = allProperties.filter(p => p.location.toLowerCase().includes(mentionedPlace));
            const s = getUnifiedStats(pProps);
            return `Stats for ${mentionedPlace.toUpperCase()} ${contextDateMsg}: ₹${formatMoney(s.rev)} revenue with ${s.bks} bookings across ${pProps.length} resorts.`;
        }

        // Fallback for Managers
        if (!isAdmin && userPropId) {
            const p = allProperties.find(x => x.id === userPropId)!;
            const s = getUnifiedStats([p]);
            if (isRevenue) return `Your resort's revenue ${contextDateMsg} is ₹${formatMoney(s.rev)}.`;
            if (isBooking) return `You have ${s.bks} total bookings ${contextDateMsg}.`;
            return `Resort Status (${p.name}): ${s.rooms} rooms, ${s.bks} bookings, and ₹${formatMoney(s.rev)} revenue ${contextDateMsg}.`;
        }

        // Global Stats (Admin only)
        if (isAdmin && (isRevenue || isBooking || isRooms || isMaintenance || isGlobalRequested || isTotalRequested || lowInput.includes('overall') || lowInput.includes('network'))) {
            const s = getUnifiedStats(allProperties);
            if (isRevenue) return `Global Network Revenue ${contextDateMsg} is ₹${formatMoney(s.rev)}.`;
            if (isBooking) return `There are ${s.bks} total bookings across the entire network ${contextDateMsg}.`;
            if (isRooms) return `The entire network manages ${s.rooms} rooms across all properties.`;
            return `Network Summary: ${allProperties.length} Resorts, ${s.rooms} Rooms, ${s.bks} Bookings, and ₹${formatMoney(s.rev)} Revenue ${contextDateMsg}.`;
        }

        return "I'm not sure I understand. Please ask about 'revenue', 'bookings', or 'rooms' for a specific resort.";
    };

    return (
        <div className="fixed bottom-20 right-6 z-[100] flex flex-col items-end group">
            {/* Messaging Modal */}
            {isOpen && (
                <div className="mb-4 w-[340px] md:w-[380px] h-[500px] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">HMS AI Assistant</h3>
                                <p className="text-[10px] opacity-80">Always active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/10" onClick={() => setIsOpen(false)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/10" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                    msg.sender === 'user'
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-white border text-foreground rounded-tl-none"
                                )}>
                                    {msg.text}
                                    <div className={cn("text-[9px] mt-1 opacity-50", msg.sender === 'user' ? "text-right" : "text-left")}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-card border-t flex gap-2">
                        <Input
                            placeholder="Ask about revenue, bookings, or rooms..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 h-10 rounded-xl"
                        />
                        <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}

            {/* Tooltip/Label */}
            {!isOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="bg-primary text-primary-foreground text-[10px] font-bold py-1 px-3 rounded-full shadow-lg whitespace-nowrap animate-bounce-slow capitalize">
                        Ask Data Queries ✨
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-20 w-20 transition-all duration-500 hover:scale-110 flex items-center justify-center relative",
                    isOpen ? "rotate-90" : ""
                )}
            >
                {isOpen ? (
                    <div className="bg-destructive text-white rounded-full p-3 shadow-xl hover:bg-destructive/90 transform transition-transform hover:rotate-90">
                        <X className="h-8 w-8" />
                    </div>
                ) : (
                    <img
                        src="/Chatbot.gif"
                        alt="AI Assistant"
                        className="h-full w-full object-contain drop-shadow-2xl filter brightness-105 contrast-105"
                    />
                )}
            </button>
        </div>
    );
}
