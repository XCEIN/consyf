'use client'
import Button from "@/components/commons/button";
import Dialog from "@/components/commons/dialog";
import { UseModalReturn } from "@/hooks/ui/useModal";
import { cn } from "@/lib/utils";
import { CloudUpload, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import InputDropdown, {
  Option as InputDropdownOption,
} from "@/components/shared/form/input-dropdown";
import { AccountData } from "../profile";
import { API_URL } from "@/constants/api.const";

const accountTypes: InputDropdownOption[] = [
  { id: 1, value: "personal", label: "Cá nhân" },
  { id: 2, value: "organization", label: "Tổ chức" },
];

export function getAccountTypeLabel(value: string) {
  return accountTypes.find((i) => i.value === value)?.label || "";
}

interface EditAccountDialogProps {
  useModal: UseModalReturn;
  setAccount: (value: AccountData) => void;
  account: AccountData | null;
}
export default function EditAccountDialog({
  useModal,
  setAccount,
  account,
}: EditAccountDialogProps) {
  const { isOpen, toggle, close } = useModal;
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string>("personal");
  const [name, setName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string>("");

  useEffect(() => {
    if (account) {
      setName(account.fullName);
      setAccountType(account.accountType || "personal");
      setAvatarPreview(account.avatar || null);
    }
  }, [account]);

  const handleAccountTypeChange = (newType: string) => {
    const oldType = account?.accountType || "personal";
    
    // Check if account type is changing
    if (oldType !== newType) {
      if (oldType === "personal" && newType === "organization") {
        setWarningMessage(
          "⚠️ Khi chuyển từ tài khoản Cá nhân sang Tổ chức, dự án hiện tại của bạn sẽ tự động bị xóa. Bạn có chắc chắn muốn tiếp tục?"
        );
        setShowWarning(true);
      } else if (oldType === "organization" && newType === "personal") {
        setWarningMessage(
          "⚠️ Khi chuyển từ tài khoản Tổ chức sang Cá nhân, tất cả các dự án của tổ chức sẽ tự động bị xóa. Bạn có chắc chắn muốn tiếp tục?"
        );
        setShowWarning(true);
      }
    } else {
      setShowWarning(false);
    }
    
    setAccountType(newType);
  };

  const submit = async () => {
    setError(null);

    if (name.length === 0 || accountType.length === 0) {
      setError("Vui lòng điền đầy đủ tên và loại tài khoản");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập");
        return;
      }

      // Upload avatar if new file selected
      let avatarUrl = avatarPreview || "";
      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);

        const uploadResponse = await fetch(
          `${API_URL}/api/profile/avatar`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          avatarUrl = uploadData.avatarUrl;
        } else {
          throw new Error("Failed to upload avatar");
        }
      }

      // Update profile
      const updateData: any = {
        name: name,
        account_type: accountType,
      };
      
      // Only include avatar if it's a valid URL or relative path
      if (avatarUrl && (avatarUrl.startsWith('/') || avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
        updateData.avatar = avatarUrl;
      }
      
      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Update local state
      setAccount({
        fullName: name,
        accountType: accountType,
        avatar: avatarUrl,
      });

      // Update localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = name;
        user.account_type = accountType;
        user.avatar = avatarUrl;
        localStorage.setItem("user", JSON.stringify(user));
      }

      close();
      
      // Reload page to update tabs and UI based on new account type
      window.location.reload();
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <Dialog.Content className="p-0" showCloseButton={false}>
        <Dialog.Title className=""></Dialog.Title>
        <div className="px-6 pt-6 flex justify-between">
          <h1 className="text-lg font-semibold">Cập nhật thông tin cá nhân</h1>
          <button onClick={close} className="cursor-pointer">
            <X className="text-app-neutral-gray4" />
          </button>
        </div>
        <div className="px-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <AvatarUploader
              defaultAvatarPreview={avatarPreview}
              setAvatar={(file) => setAvatar(file)}
              setAvatarPreview={(pv) => setAvatarPreview(pv)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Tên người dùng <span className="text-red-500">*</span>
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
                placeholder="Nhập tên của bạn"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-app-neutral-gray1">
              Loại tài khoản <span className="text-red-500">*</span>
            </label>
            <InputDropdown
              defaultValue={accountType}
              options={accountTypes}
              onChange={(v) => {
                if (!Array.isArray(v)) {
                  handleAccountTypeChange(v);
                }
              }}
            />
            {showWarning && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
                {warningMessage}
              </div>
            )}
          </div>
        </div>
        <div className="pt-8">
          <div className="grid grid-cols-2 px-6 pb-6 gap-3">
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={close}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button
              onClick={submit}
              disabled={isSubmitting}
              className="bg-app-blue hover:bg-app-blue/90 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function AvatarUploader({
  setAvatar,
  setAvatarPreview,
  defaultAvatarPreview,
}: {
  setAvatar: (file: File) => void;
  setAvatarPreview: (value: string) => void;
  defaultAvatarPreview: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (defaultAvatarPreview) {
      setPreview(defaultAvatarPreview);
    }
  }, [defaultAvatarPreview]);

  const handleView = (file: File) => {
    setAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleView(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleView(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
      {/* Avatar hiển thị */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="object-cover w-full h-full"
          />
        ) : (
          <User className="w-8 h-8 text-gray-400" />
        )}
      </div>

      {/* Khu vực chọn ảnh */}
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "flex flex-col items-center justify-center cursor-pointer border border-gray-200 rounded-xl px-8 py-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
        )}
      >
        <CloudUpload className="w-5 h-5 text-gray-500 mb-1" />
        <p className="text-sm">
          <span className="text-blue-600 font-medium">Chọn một hình</span> hoặc
          kéo hoặc thả
        </p>
        <p className="text-xs text-gray-500">
          Chúng tôi hỗ trợ PNG, JPG (dung lượng tối đa 5MB)
        </p>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
