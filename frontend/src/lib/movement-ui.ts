import { ArrowDownRight, ArrowUpRight, HelpCircle, RefreshCw } from "lucide-react";

export const MOVEMENT_UI_CONFIG: Record<string, any> = {
    IN: {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        selectText: 'text-emerald-600',
        icon: ArrowDownRight,
        shortLabel: 'IN',
        fullLabel: 'IN (Receive)'
    },
    OUT: {
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
        selectText: 'text-rose-600',
        icon: ArrowUpRight,
        shortLabel: 'OUT',
        fullLabel: 'OUT (Dispatch)'
    },
    TRANSFER: {
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        selectText: 'text-blue-600',
        icon: RefreshCw,
        shortLabel: 'TRANS',
        fullLabel: 'TRANSFER'
    },
    DEFAULT: {
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-800',
        selectText: 'text-gray-600',
        icon: HelpCircle,
        shortLabel: 'OTHER',
        fullLabel: 'Unknown Type'
    }
};