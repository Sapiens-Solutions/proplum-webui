import React from "react";
import { useParamsData } from "./hooks/useParamsData";

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // This function should be called inside of react router, that's why it's placed inside Layout component
  useParamsData();

  return children;
};
