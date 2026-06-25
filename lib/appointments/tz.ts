import { createContext, useContext } from "react";

export const TzContext = createContext<string | undefined>(undefined);

export function useTz(): string | undefined {
  return useContext(TzContext);
}
