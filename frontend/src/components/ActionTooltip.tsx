import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface ActionTooltipProps {
  children: ReactNode;
  label: string;
  showTooltip?: boolean;
}

export default function ActionTooltip({ children, label, showTooltip = true }: ActionTooltipProps) {
  if (!showTooltip) {
    return <>{children}</>;
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 text-white text-xs px-2 py-1 rounded">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}