import { Package } from "lucide-react";

export default function Logo() {
    return (
        <div className="flex justify-center items-center space-x-2">
            <Package className="h-6 w-6 text-blue-500" />
            <span className="text-2xl font-bold tracking-wider">STOCKFLOW</span>
        </div>
    );
}