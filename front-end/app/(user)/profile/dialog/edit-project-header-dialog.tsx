'use client'
import Button from "@/components/commons/button";
import Dialog from "@/components/commons/dialog";
import { UseModalReturn } from "@/hooks/ui/useModal";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import InputDropdown, {
  Option as InputDropdownOption,
} from "@/components/shared/form/input-dropdown";

const fieldOptions: InputDropdownOption[] = [
  { id: 1, label: "Thời trang", value: "fashion" },
  { id: 2, label: "Môi trường", value: "environment" },
  { id: 3, label: "Ẩm thực", value: "food" },
  { id: 4, label: "Công nghệ - Kỹ thuật", value: "technology" },
  { id: 5, label: "Giáo dục", value: "education" },
  { id: 6, label: "Kinh doanh", value: "business" },
  { id: 7, label: "Nông - Lâm - Ngư nghiệp", value: "agriculture" },
];

export function getFieldsLabel(values: string[]) {
  return fieldOptions.reduce<string[]>((prev, curr) => {
    if (values.includes(curr.value)) {
      return [...prev, curr.label];
    }
    return prev;
  }, []);
}
export interface ProjectHeaderData {
  name: string;
  fields: string[];
}
interface EditProjectHeaderDialogProps {
  useModal: UseModalReturn;
  setData: (value: ProjectHeaderData) => void;
  data: ProjectHeaderData | null;
}
export default function EditProjectHeaderDialog({
  useModal,
  data,
  setData,
}: EditProjectHeaderDialogProps) {
  const { isOpen, toggle, close } = useModal;
  const [fields, setFields] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  useEffect(() => {
    if (data) {
      setFields(data.fields);
      setName(data.name);
    }
  }, [data]);
  const submit = () => {
    if (name.length === 0 || fields.length === 0) {
      alert("Vui lòng điền đầy đủ các trường");
      return;
    }
    setData({
      name: name,
      fields: fields,
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
              Tên dự án*
            </label>
            <div
              className={cn(
                "relative px-3.5 py-2.5 border bg-white rounded-xl cursor-pointer shadow-xs min-h-[60px]",
                "flex flex-col justify-center",
                {
                  "border-green-200": name.length !== 0,
                }
              )}
            >
              <input
                value={name}
                type="text"
                className="outline-none"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Lĩnh vực hoạt động
            </label>
            <InputDropdown
              defaultValue={fields}
              multipleMaxSelect={2}
              options={fieldOptions}
              mode="multiple"
              onChange={(v) => {
                if (Array.isArray(v)) {
                  setFields(v);
                }
              }}
            />
            <p
              className={cn("text-xs text-[12px]", {
                "text-green-800": fieldOptions.length > 0,
              })}
            >
              Lĩnh vực đã chọn {fields.length}/2
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
