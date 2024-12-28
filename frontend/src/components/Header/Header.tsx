import React from "react";

interface HeaderProps {
  label: string;
}

export const Header: React.FC<HeaderProps> = ({ label }) => {
  return (
    <div className="flex min-h-[87px] border-b p-4 text-[36px] font-bold">
      {label}
    </div>
  );
};
