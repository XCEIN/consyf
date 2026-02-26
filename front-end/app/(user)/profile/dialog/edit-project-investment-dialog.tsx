'use client'
import Button from "@/components/commons/button";
import Dialog from "@/components/commons/dialog";
import { UseModalReturn } from "@/hooks/ui/useModal";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import InputDropdown, {
  Option as InputDropdownOption,
} from "@/components/shared/form/input-dropdown";

const currencyOptions: InputDropdownOption[] = [
  { id: 1, label: "USD", value: "USD" },
  { id: 2, label: "VND", value: "VND" },
];

const fundingStageOptions: InputDropdownOption[] = [
  { id: 1, label: "Giám đốc công nghệ", value: "tech" },
  { id: 2, label: "Giám đốc tài chính", value: "finance" },
  { id: 3, label: "Giám đốc marketing", value: "marketing" },
  { id: 4, label: "Giám đốc vận hành", value: "operations" },
  { id: 5, label: "Giám đốc sản phẩm", value: "product" },
  { id: 6, label: "Giám đốc chiến lược", value: "strategy" },
  { id: 7, label: "Giám đốc đổi mới", value: "innovation" },
];

const partnerOptions: InputDropdownOption[] = [
  { id: 1, label: "Đối tác công nghệ", value: "tech-partner" },
  { id: 2, label: "Đối tác chiến lược", value: "strategy" },
  { id: 3, label: "Đối tác phân phối", value: "distribution" },
  { id: 4, label: "Đối tác bán hàng", value: "sales" },
  { id: 5, label: "Đối tác tiếp thị", value: "marketing-partner" },
  { id: 6, label: "Đối tác sản xuất", value: "manufacturing" },
  { id: 7, label: "Đối tác thương mại điện tử", value: "ecommerce" },
];

export function getFundingStageLabel(values: string[]) {
  return fundingStageOptions.reduce<string[]>((prev, curr) => {
    if (values.includes(curr.value)) {
      return [...prev, curr.label];
    }
    return prev;
  }, []);
}
export function getPartnerLabel(values: string[]) {
  return partnerOptions.reduce<string[]>((prev, curr) => {
    if (values.includes(curr.value)) {
      return [...prev, curr.label];
    }
    return prev;
  }, []);
}
export interface ProjectInvestmentData {
  partners: string[];
  fundingStage: string[];
  currency: string;
  investmentValue: number;
}
interface EditProjectInvestmentDialogProps {
  useModal: UseModalReturn;
  setData: (value: ProjectInvestmentData) => void;
  data: ProjectInvestmentData | null;
}
export default function EditProjectInvestmentDialog({
  useModal,
  data,
  setData,
}: EditProjectInvestmentDialogProps) {
  const { isOpen, toggle, close } = useModal;
  const [currency, setCurrency] = useState<string>("USD");
  const [fundingStages, setFundingStages] = useState<string[]>([]);
  const [partners, setPartners] = useState<string[]>([]);
  const [investmentValue, setInvestmentValue] = useState<number>(0);
  useEffect(() => {
    if (data) {
      setCurrency(data.currency)
      setFundingStages(data.fundingStage)
      setPartners(data.partners)
      setInvestmentValue(data.investmentValue)
    }
  }, [data]);
  const submit = () => {
    if (
      investmentValue === 0 ||
      fundingStages.length === 0 ||
      partners.length === 0
    ) {
      alert("Vui lòng điền đầy đủ các trường");
      return;
    }
    setData({
      fundingStage: fundingStages,
      partners: partners,
      currency: currency,
      investmentValue: investmentValue,
    });
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <Dialog.Content className="p-0">
        <Dialog.Title className=""></Dialog.Title>
        <div className="px-6 flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Vốn huy động
            </label>
            <div
              className={cn(
                "relative px-3.5 py-2.5 border bg-white rounded-xl cursor-pointer shadow-xs min-h-[60px]",
                "flex",
                {
                  "border-green-200": investmentValue !== 0,
                }
              )}
            >
              <input
                value={investmentValue}
                type="number"
                min={0}
                className="outline-none flex-1"
                onChange={(e) => setInvestmentValue(Number(e.target.value))}
              />
              <select
                className="cursor-pointer border-l pl-3.5"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencyOptions.map((c) => (
                  <option
                    className="cursor-pointer"
                    key={c.value}
                    value={c.value}
                  >
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Đồng sáng lập
            </label>
            <InputDropdown
              defaultValue={fundingStages}
              multipleMaxSelect={2}
              options={fundingStageOptions}
              mode="multiple"
              onChange={(v) => {
                if (Array.isArray(v)) {
                  setFundingStages(v);
                }
              }}
            />
            <p
              className={cn("text-xs text-[12px]", {
                "text-green-800": fundingStages.length > 0,
              })}
            >
              Đồng sáng lập đã chọn {fundingStages.length}/2
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Đối tác
            </label>
            <InputDropdown
              defaultValue={partners}
              multipleMaxSelect={2}
              options={partnerOptions}
              mode="multiple"
              onChange={(v) => {
                if (Array.isArray(v)) {
                  setPartners(v);
                }
              }}
            />
            <p
              className={cn("text-xs text-[12px]", {
                "text-green-800": partners.length > 0,
              })}
            >
              Đối tác đã chọn {partners.length}/2
            </p>
          </div>
        </div>
        <div className="pt-8">
          <div className="grid grid-cols-2 px-6 pb-6 gap-3">
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={close}
            >
              Huỷ
            </Button>
            <Button
              onClick={submit}
              className="bg-app-blue hover:bg-app-blue/90 cursor-pointer"
            >
              Lưu
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
