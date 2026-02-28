import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "./ui/table";

interface SortableTableHeadProps {
    label: string;
    column: string;
    currentSortBy: string;
    currentSortOrder: 'asc' | 'desc';
    onSort: (column: string) => void;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export default function SortableTableHead({
    label,
    column,
    currentSortBy,
    currentSortOrder,
    onSort,
    className = "",
    align = 'left'
}: SortableTableHeadProps) {
    const isActive = currentSortBy === column;

    const alignmentClass =
        align === 'right' ? 'justify-end' :
        align === 'center' ? 'justify-center' :
        'justify-start';

    return (
        <TableHead
            className={`cursor-pointer hover:bg-slate-200 transition-colors ${className}`}
            onClick={() => onSort(column)}
        >
            <div className={`flex items-center ${alignmentClass}`}>
                {label}
                {isActive ? (
                    currentSortOrder === 'asc'
                        ? <ArrowUp className="ml-2 h-4 w-4 text-slate-700" />
                        : <ArrowDown className="ml-2 h-4 w-4 text-slate-700" />
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4 text-slate-300 opacity-50" />
                )}
            </div>
        </TableHead>
    );
}