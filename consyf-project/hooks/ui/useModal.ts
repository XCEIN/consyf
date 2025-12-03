import { useEffect, useState } from "react";

enum Condition {
  TRUE = "1",
  FALSE = "0",
}
export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
export default function useModal(
  defaultOpen: boolean = false,
  options?: { isSaveLocalstorage: boolean; localstorageKey: string }
): UseModalReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useEffect(() => {
    if (options && options.isSaveLocalstorage) {
      const value: string | null = localStorage.getItem(
        options.localstorageKey
      );
      if (value) {
        setIsOpen(value === Condition.TRUE);
      }
    }
  }, [options]);
  const saveLocalstorage = (condition: Condition) => {
    if (options && options.isSaveLocalstorage) {
      localStorage.setItem(options.localstorageKey, condition);
    }
  };
  return {
    isOpen,
    open: () => {
      setIsOpen(true);
      saveLocalstorage(Condition.TRUE);
    },
    close: () => {
      setIsOpen(false);
      saveLocalstorage(Condition.FALSE);
    },
    toggle: () => {
      saveLocalstorage(isOpen ? Condition.FALSE : Condition.TRUE);
      setIsOpen((prev) => !prev);
    },
  };
}
