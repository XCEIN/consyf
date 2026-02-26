"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Fragment } from "react/jsx-runtime";

interface BreadcrumbLabel {
  label: string;
  href: string;
}
interface Breadcrumb {
  labelCurrent: string;
  labelPrevious: BreadcrumbLabel[];
}
export default function Breadcrumb({
  labelPrevious,
  labelCurrent,
}: Breadcrumb) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-2")}>
      {labelPrevious.map(({ label, href }) => {
        return (
          <Fragment key={href}>
            <li>
              <Link href={href}> {label}</Link>
            </li>
            <li>/</li>
          </Fragment>
        );
      })}
      <li className={cn("text-blue-600 font-medium")}>{labelCurrent}</li>
    </ol>
  );
}
