// src/components/common/DataTablePagination.tsx
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function DataTablePagination({
    currentPage,
    totalPages,
    onPageChange,
}: DataTablePaginationProps) {
    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className="py-4 px-6 border-t border-slate-200 bg-slate-50 rounded-b-lg">
            <Pagination className="justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <span className="text-sm font-medium text-slate-600 mx-4">
                            Page {currentPage} of {totalPages}
                        </span>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}