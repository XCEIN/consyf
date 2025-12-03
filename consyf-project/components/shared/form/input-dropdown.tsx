import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  id: number;
  label: string;
  value: string;
}

interface DropdownProps {
  placeholder?: string;
  options: Option[];
  mode?: "single" | "multiple";
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multipleMaxSelect?: number;
}

export default function InputDropdown({
  placeholder = "",
  options,
  mode = "single",
  defaultValue,
  onChange,
  multipleMaxSelect = 2,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedSingle, setSelectedSingle] = useState<string>(
    mode === "single" && typeof defaultValue === "string" ? defaultValue : ""
  );
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>(
    mode === "multiple" && Array.isArray(defaultValue) ? defaultValue : []
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSingle = (option: Option): void => {
    setSelectedSingle(option.value);
    setIsOpen(false);
    onChange?.(option.value);
  };

  const handleSelectMultiple = (option: Option): void => {
    const newSelection = selectedMultiple.includes(option.value)
      ? selectedMultiple.filter((v) => v !== option.value)
      : [...selectedMultiple, option.value];

    if (newSelection.length > multipleMaxSelect) {
      return;
    }
    setSelectedMultiple(newSelection);
    onChange?.(newSelection);
  };

  const handleClearSingle = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setSelectedSingle("");
    onChange?.("");
  };

  const handleClearMultipleItem = (
    value: string,
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.stopPropagation();
    const newSelection = selectedMultiple.filter((v) => v !== value);
    setSelectedMultiple(newSelection);
    onChange?.(newSelection);
  };

  const getSelectedLabel = (value: string): string => {
    return options.find((opt) => opt.value === value)?.label || "";
  };

  const isSelected = (value: string): boolean => {
    return mode === "single"
      ? selectedSingle === value
      : selectedMultiple.includes(value);
  };

  return (
    <div
      className={cn(
        "relative px-3.5 py-2.5 border bg-white rounded-xl cursor-pointer shadow-xs min-h-[60px]",
        "flex flex-col justify-center",
        {
          "border-green-200":  selectedSingle.length !== 0 || selectedMultiple.length !== 0,
        }
      )}
      ref={dropdownRef}
    >
      {/* Selected Value Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between transition-colors "
      >
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {mode === "single" && selectedSingle && (
            <span className="border border-app-neutral-gray5 px-2 py-0.5 rounded-[6px] text-sm font-medium flex items-center gap-2">
              {getSelectedLabel(selectedSingle)}
              <button
                onClick={handleClearSingle}
                className="rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={12} className="text-app-neutral-gray4" />
              </button>
            </span>
          )}

          {mode === "multiple" && selectedMultiple.length > 0 && (
            <>
              {selectedMultiple.map((value) => (
                <span
                  key={value}
                  className="border border-app-neutral-gray5 px-2 py-0.5 rounded-[6px] text-sm font-medium flex items-center gap-2"
                >
                  {getSelectedLabel(value)}

                  <button
                    onClick={(e) => handleClearMultipleItem(value, e)}
                    className="rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X size={12} className="text-app-neutral-gray4" />
                  </button>
                </span>
              ))}
            </>
          )}

          {((mode === "single" && !selectedSingle) ||
            (mode === "multiple" && selectedMultiple.length === 0)) && (
            <span className="text-app-neutral-gray4">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-app-neutral-gray4 transition-transform duration-200 shrink-0  ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 max-h-32 lg:max-h-40 2xl:max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() =>
                mode === "single"
                  ? handleSelectSingle(option)
                  : handleSelectMultiple(option)
              }
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${
                isSelected(option.value) ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Radio/Checkbox */}
                {mode === "single" ? (
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected(option.value)
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected(option.value) && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Option Label */}
                <span
                  className={`text-sm text-gray-700 ${
                    isSelected(option.value) ? " font-medium" : ""
                  }`}
                >
                  {option.label}
                </span>
              </div>

              {/* Checkmark for multi-select */}
              {mode === "multiple" && isSelected(option.value) && (
                <Check size={18} className="text-blue-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
