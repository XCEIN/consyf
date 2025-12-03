"use client";
import Button from "@/components/commons/button";
import Dialog from "@/components/commons/dialog";
import Editor from "@/components/shared/form/editor";
import { UseModalReturn } from "@/hooks/ui/useModal";
import { useEffect, useState } from "react";

export interface ProjectDescriptionData {
  description: string;
}
interface EditProjectDescDialogProps {
  useModal: UseModalReturn;
  setData: (value: ProjectDescriptionData) => void;
  data: ProjectDescriptionData | null;
}
export default function EditProjectDescDialog({
  useModal,
  data,
  setData,
}: EditProjectDescDialogProps) {
  const { isOpen, toggle, close } = useModal;
  const [desc, setDesc] = useState<string>("");
  useEffect(() => {
    if (data) {
      setDesc(data.description);
    }
  }, [data]);
  const submit = () => {
    setData({ description: desc });
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <Dialog.Content className="p-0 w-full sm:max-w-6xl max-w-none">
        <Dialog.Title className=""></Dialog.Title>

        <div className="px-6 flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Mô tả*
            </label>
            <Editor
              onChangeHTML={(html) => setDesc(html)}
              placeholder="Viết mô tả ngắn về dự án..."
              defaultValue={desc}
              onChange={() => {}}
            />
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
