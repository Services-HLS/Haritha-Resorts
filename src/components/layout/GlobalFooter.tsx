export function GlobalFooter() {
    const year = new Date().getFullYear();
    return (
        <footer className="bg-card text-muted-foreground border-t py-4 px-4 md:px-8 text-center text-sm shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="font-medium text-xs md:text-sm">© {year} Haritha Resorts. Managed by State Tourism Board.</p>
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-primary transition-colors">Support Desk</a>
                </div>
            </div>
        </footer>
    );
}
