import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";

export const Layout: React.FC = () => {
  return (
    <div className="flex items-start justify-between font-geist">
      <div className="hidden min-h-screen min-w-[300px] border-r md:flex">
        <Sidebar />
      </div>
      <main className="h-full w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
