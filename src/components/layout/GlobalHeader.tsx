import { Building2 } from 'lucide-react';

export function GlobalHeader() {
    return (
        <header className="bg-primary text-primary-foreground py-3 px-4 md:px-6 shadow-md z-50 shrink-0">
            <div className="w-full flex items-center justify-between relative">
                <div className="flex items-center">
                    <div className="bg-white p-1 rounded-xl shadow-md h-12 w-12 md:h-14 md:w-14 flex items-center justify-center shrink-0 border-2 border-white/20 overflow-hidden">
                        <img src="/Haritha_logo.svg" alt="Haritha Logo" className="h-full w-full object-contain" />
                    </div>
                </div>

                {/* Centered Title */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center text-center w-max">
                    <h1 className="text-base md:text-xl font-extrabold leading-tight tracking-wide">Haritha Resorts</h1>
                    <p className="text-[9px] md:text-[11px] text-primary-foreground/90 uppercase tracking-widest font-semibold mt-0.5">
                        State Tourism Development Corporation
                    </p>
                </div>

                <div className="hidden md:flex flex-col items-end text-xs text-primary-foreground/90 space-y-0.5 shrink-0">
                    <span className="font-semibold tracking-wide">Official Management Portal</span>
                    <span>Govt. Enterprise Edition v2.4</span>
                </div>
            </div>
        </header>
    );
}
