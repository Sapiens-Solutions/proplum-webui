import { Header } from "@/components/Header/Header";
import React from "react";

export const Home: React.FC = () => {
  return (
    <>
      <Header label="Proplum Framework" />
      <div className="p-4">Выберите таблицу в боковой панели</div>
    </>
  );
};
