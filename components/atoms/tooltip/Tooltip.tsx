import { Button } from "@/components/ui/button";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export default function Tooltip({
  trigger,
  content,
}: {
  trigger: React.ReactNode;
  content: string;
}) {
  return (
    <TooltipPrimitive>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{content}</p>
      </TooltipContent>
      <p className="hidden sr-only">{content}</p>
    </TooltipPrimitive>
  );
}
