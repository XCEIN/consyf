import {
  ComponentProps,
  HTMLInputTypeAttribute,
  useEffect,
  useState,
} from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { LucideIcon, EyeClosed, EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Input({
  error,
  icon,
  type,
  wrapClassName,
  groupClassName,
  ...props
}: ComponentProps<"input"> & {
  error?: string;
  icon?: LucideIcon;
  type?: HTMLInputTypeAttribute;
  wrapClassName?: string;
  groupClassName?: string;
}) {
  const [type$, setType] = useState<HTMLInputTypeAttribute>(type || "text");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const Icon = icon;
  useEffect(() => {
    if (type === "password") {
      setType("password");
      setPasswordVisible(false);
    }
  }, [type]);

  return (
    <div className={cn("flex flex-col gap-1", !wrapClassName?.includes("max-w") && "md:max-w-96", wrapClassName)}>
      <InputGroup className={cn("h-11", groupClassName)}>
        <InputGroupInput {...props} type={type$} />
        {Icon && (
          <InputGroupAddon>
            <Icon />
          </InputGroupAddon>
        )}
        {type === "password" && (
          <InputGroupAddon align="inline-end" className="cursor-pointer">
            {passwordVisible ? (
              <EyeClosed
                onClick={() => {
                  setType("password");
                  setPasswordVisible(false);
                }}
              />
            ) : (
              <EyeIcon
                onClick={() => {
                  setType("text");
                  setPasswordVisible(true);
                }}
              />
            )}
          </InputGroupAddon>
        )}
      </InputGroup>
      {error && (
        <span className="text-red-800 w-full rounded py-2.5 text-sm">
          {error}
        </span>
      )}
    </div>
  );
}
export default Input;
