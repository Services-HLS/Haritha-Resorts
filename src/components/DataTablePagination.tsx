import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTablePaginationProps {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function DataTablePagination({ totalItems, currentPage, itemsPerPage, onPageChange }: DataTablePaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalItems === 0) return null;

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-card/50">
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex}</span> - <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalItems}</span> items
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
