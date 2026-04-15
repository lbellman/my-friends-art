import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmVariant,
  title,
  description,
  confirmLabel,
}: {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmVariant: "destructive" | "success" | "default";
  confirmLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title.toLowerCase()}</DialogTitle>
          <p className="body2 text-muted-foreground">{description}</p>
          <DialogFooter>
            <Button variant={confirmVariant} data-testid="dialog-confirm-button" onClick={onConfirm}>
              {confirmLabel}
            </Button>
            <Button variant="outline" data-testid="dialog-cancel-button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
