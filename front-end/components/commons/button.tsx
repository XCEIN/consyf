import { cn } from "@/lib/utils";
import { Button as BtnShadcn, ButtonProps } from "../ui/button";

export default function Button({ className, ...props }: ButtonProps) {
  return <BtnShadcn {...props} className={cn(className)} />;
}
