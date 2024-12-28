import React from "react";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/Icons/Logo";
import { SidebarItemsList } from "./SidebarItemsList";

export const Sidebar: React.FC = () => {
  return (
    <div className="fixed flex min-h-screen w-[300px] min-w-[300px] flex-col overflow-y-auto p-4">
      <div className="ml-auto mr-auto w-1/2 text-darkblue">
        <Logo />
      </div>
      <Separator className="mt-6" />
      <SidebarItemsList />
    </div>
  );
};
