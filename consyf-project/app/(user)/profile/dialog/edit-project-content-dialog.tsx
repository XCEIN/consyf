'use client'
import Button from "@/components/commons/button";
import Dialog from "@/components/commons/dialog";
import { UseModalReturn } from "@/hooks/ui/useModal";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import InputDropdown, {
  Option as InputDropdownOption,
} from "@/components/shared/form/input-dropdown";

const locationOptions: InputDropdownOption[] = [
  { id: 1, label: "Hà Nội", value: "hanoi" },
  { id: 2, label: "TP. Hồ Chí Minh", value: "hcm" },
  { id: 3, label: "Cần Thơ", value: "cantho" },
  { id: 4, label: "Bình Dương", value: "binhduong" },
  { id: 5, label: "Hải Phòng", value: "haiphong" },
  { id: 6, label: "Khánh Hòa", value: "khanhhoa" },
  { id: 7, label: "Đà Nẵng", value: "danang" },
];
export function getLocationsLabel(values: string[]) {
  return locationOptions.reduce<string[]>((prev, curr) => {
    if (values.includes(curr.value)) {
      return [...prev, curr.label];
    }
    return prev;
  }, []);
}
export interface ProjectContentData {
  email: string;
  locations: string[];
  website: string;
  portfolio: string;
}
interface EditProjectContentDialogProps {
  useModal: UseModalReturn;
  setData: (value: ProjectContentData) => void;
  data: ProjectContentData | null;
}
export default function EditProjectContentDialog({
  useModal,
  data,
  setData,
}: EditProjectContentDialogProps) {
  const { isOpen, toggle, close } = useModal;
  const [locations, setLocations] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [web, setWeb] = useState<string>("");
  const [portfolio, setPortfolio] = useState<string>("");
  useEffect(() => {
    if (data) {
    }
  }, [data]);
  const submit = () => {
    if (
      locations.length === 0 ||
      email.length === 0 ||
      web.length === 0 ||
      portfolio.length === 0
    ) {
      alert("Vui lòng điền đầy đủ các trường");
      return;
    }
    setData({
      email: email,
      locations: locations,
      website: web,
      portfolio: portfolio,
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
              Địa chỉ
            </label>
            <InputDropdown
              defaultValue={locations}
              multipleMaxSelect={2}
              options={locationOptions}
              mode="multiple"
              onChange={(v) => {
                if (Array.isArray(v)) {
                  setLocations(v);
                }
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Email
            </label>
            <div
              className={cn(
                "relative px-3.5 py-2.5 border bg-white rounded-xl cursor-pointer shadow-xs min-h-[60px]",
                "flex flex-col justify-center",
                {
                  "border-green-200": email.length !== 0,
                }
              )}
            >
              <input
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                type="email"
                className="outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Website
            </label>
            <div
              className={cn(
                "relative px-3.5 py-2.5 border bg-white rounded-xl cursor-pointer shadow-xs min-h-[60px]",
                "flex flex-col justify-center",
                {
                  "border-green-200": web.length !== 0,
                }
              )}
            >
              <input
                placeholder="Nhập địa chỉ website của bạn"
                value={web}
                type="url"
                className="outline-none"
                onChange={(e) => setWeb(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Portfolio
            </label>
            <div
              className={cn(
                "relative px-3.5 py-2.5 border bg-white rounded-xl cursor-pointer shadow-xs min-h-[60px]",
                "flex flex-col justify-center",
                {
                  "border-green-200": portfolio.length !== 0,
                }
              )}
            >
              <input
                placeholder="Nhập liên kết portfolio của bạn"
                value={portfolio}
                type="url"
                className="outline-none"
                onChange={(e) => setPortfolio(e.target.value)}
              />
            </div>
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
