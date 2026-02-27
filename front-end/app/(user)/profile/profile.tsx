"use client";

import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import ProjectSection from "./project-section";
import NotificationSection from "./notification-section";
import PostsList from "./posts-list";
import useModal from "@/hooks/ui/useModal";
import EditAccountDialog, {
  getAccountTypeLabel,
} from "./dialog/edit-account-dialog";
import { ComponentProps, FC, ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import useWindowSize from "@/contexts/window-size.context";
import ImageIcon from "@/components/shared/image-icon";
import ButtonEdit from "@/components/shared/user/edit-button";
import { API_URL } from "@/constants/api.const";

type TabType = "project" | "notification" | "manage-projects";
const TabText: Record<TabType, string> = {
  notification: "Thông báo",
  project: "Thông tin dự án",
  "manage-projects": "Quản lý dự án",
};
export interface AccountData {
  fullName: string;
  accountType: string;
  avatar: string; // URL from backend
}
export default function ProfilePageClient() {
  const { width } = useWindowSize();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("project");
  const editAccountModal = useModal(false);
  
  // Determine tabs based on account type - default to personal tabs
  const tabs: TabType[] = account?.accountType === 'organization' 
    ? ["project", "manage-projects", "notification"]
    : ["project", "notification"];
    
  // Simple tab management without useTab hook
  const isTabActive = (tab: TabType) => currentTab === tab;
  const setTabCurrent = (tab: TabType) => {
    if (tabs.includes(tab)) {
      setCurrentTab(tab);
    }
  };

  // Load user profile from backend - FIX: Use useEffect instead of useState
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAccount({
            fullName: data.name,
            accountType: data.account_type || "personal",
            avatar: data.avatar || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);
  const AccountTypeBadge: FC<ComponentProps<"span">> = ({
    className,
    ...props
  }) => {
    return (
      <span
        {...props}
        className={cn(
          "px-3 py-1 border bg-app-neutral-gray5 rounded-2xl",
          {
            "bg-green-50 border-green-200 text-green-700": account !== null,
          },
          className
        )}
      >
        {account ? getAccountTypeLabel(account.accountType) : "Chưa có"}
      </span>
    );
  };
  return (
    <>
      <>
        <EditAccountDialog
          account={account}
          useModal={editAccountModal}
          setAccount={setAccount}
        />
      </>
      <div className={cn("flex flex-col gap-10 lg:gap-12 py-12")}>
        <div className={cn("container mx-auto")}>
          <div
            className={cn(
              "flex flex-col lg:flex-row items-center justify-between px-6 gap-6 pb-6 border-b"
            )}
          >
            <div className={cn("flex flex-col lg:flex-row items-center gap-6")}>
              {/* Logo  */}
              <div
                className={cn(
                  "w-40 h-40 bg-app-neutral-gray7 border-2 border-white rounded-full shadow",
                  "flex flex-col justify-center items-center overflow-hidden"
                )}
              >
                {account && account.avatar ? (
                  <img
                    src={account.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={80} className="text-app-neutral-gray3" />
                )}
              </div>
              <div className={cn("flex flex-col gap-1")}>
                <div
                  className={cn("flex flex-col lg:flex-row items-center gap-5")}
                >
                  <h1
                    className={cn("font-semibold text-3xl order-2 lg:order-1")}
                  >
                    {account ? account.fullName : "NguyenVanA"}
                  </h1>
                  <span
                    className={cn(
                      "px-3 py-1 border bg-app-neutral-gray5 rounded-2xl order-1 lg:order-2",
                      {
                        "bg-green-50 border-green-200 text-green-700":
                          account !== null,
                      }
                    )}
                  >
                    {account
                      ? getAccountTypeLabel(account.accountType)
                      : "Chưa có"}
                  </span>
                </div>
                <p className={cn("text-app-neutral-gray4 text-center lg:text-left")}>
                  {account?.accountType
                    ? getAccountTypeLabel(account.accountType)
                    : "Chưa cập nhật loại tài khoản"}
                </p>
              </div>
            </div>
            <div>
              <ButtonEdit onClick={editAccountModal.open}>Chỉnh sửa</ButtonEdit>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "container mx-auto",
            "flex flex-col lg:flex-row gap-10 lg:gap-16"
          )}
        >
          <div className="grid grid-cols-2 lg:flex lg:flex-col items-start">
            {tabs.map((tab) => {
              return (
                <button
                  onClick={() => setTabCurrent(tab)}
                  key={tab}
                  className={cn(
                    "py-2 px-3 text-app-neutral-gray3 font-semibold cursor-pointer",
                    {
                      "text-app-neutral-gray1 bg-app-neutral-gray6 rounded-[6px] lg:bg-transparent":
                        isTabActive(tab),
                    }
                  )}
                >
                  {TabText[tab]}
                </button>
              );
            })}
          </div>
          <div className={cn("flex-1")}>
            {isTabActive("project") && <ProjectSection accountType={account?.accountType} />}
            {isTabActive("manage-projects") && account?.accountType === 'organization' && (
              <div className={cn("rounded-[20px] border", "px-8 py-6")}>
                <h2 className="text-2xl font-semibold mb-6">Quản lý dự án</h2>
                <PostsList />
              </div>
            )}
            {isTabActive("notification") && <NotificationSection />}
          </div>
        </div>
      </div>
    </>
  );
}
