import { useContext } from "react";
import DnDContext from "../contexts/DnDContext";

export const useDnD = () => {
  return useContext(DnDContext);
};
