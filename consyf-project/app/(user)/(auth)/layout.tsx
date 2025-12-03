import { cn } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
};
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "md:py-10 container mx-auto flex flex-col justify-start items-center",
        "md:min-h-screen relative overflow-hidden"
      )}
    >
      <div
        className={cn(
          "hidden md:block absolute w-2/3 h-full top-[50%] -right-[50%] -translate-x-[50%] -translate-y-[50%] -z-10"
        )}
        style={{
          backgroundImage: "url('/images/bg/bg_pattern_decorative.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="bg-transparent backdrop-blur-3xl z-40">{children}</div>
    </div>
  );
}
