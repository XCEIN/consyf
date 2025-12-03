import { useState } from "react";

interface UseTabReturn<Type> {
  tabs: Type[];
  tabCurrent: Type;
  setTabCurrent: (tab: Type) => void;
  isTabActive: (tab: Type) => boolean;
}
export default function useTab<Type extends string>(
  tabs: Type[],
  defaultTab: Type
): UseTabReturn<Type> {
  if (!tabs.includes(defaultTab)) {
    throw new Error("defaultTab not exist");
  }
  const [tabCurrent, setTabCurrent] = useState<Type>(defaultTab);
  return {
    tabs,
    tabCurrent,
    setTabCurrent(tab) {
      if (!tabs.includes(tab)) {
        throw new Error("tab not exist");
      }
      setTabCurrent(tab);
    },
    isTabActive(tab) {
      if (!tabs.includes(tab)) {
        throw new Error("tab not exist");
      }
      if (tab === tabCurrent) {
        return true;
      }
      return false;
    },
  };
}
