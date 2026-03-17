import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onDeleteConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteConfirmed: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>confirm delete</DialogTitle>
          <p className="body2 text-muted-foreground">
            Are you sure you want to delete this art piece? This action cannot
            be undone.
          </p>
          <DialogFooter>
            <Button variant="destructive" onClick={onDeleteConfirmed}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
