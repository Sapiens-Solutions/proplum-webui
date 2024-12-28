import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../Layout/Layout";
import { DatasourceTablePage } from "@/pages/DatasourceTablePage/DatasourceTablePage";
import { Home } from "@/pages/Home/Home";
import { AppWrapper } from "../AppWrapper/AppWrapper";

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppWrapper>
              <Layout />
            </AppWrapper>
          }
        >
          <Route index element={<Home />} />
          <Route path="table">
            <Route path=":tableName" element={<DatasourceTablePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
