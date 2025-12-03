import {
  Dialog as DialogShadcn,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogProps,
  DialogFooter,
} from "@/components/ui/dialog";

function Dialog(props: DialogProps) {
  return <DialogShadcn {...props} />;
}
Dialog.Content = DialogContent;
Dialog.Description = DialogDescription;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Trigger = DialogTrigger;
Dialog.Footer = DialogFooter

export default Dialog;
