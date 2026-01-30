import { useEffect } from "react";

interface UseClearProps {
  errorMessage?: string;
  clearError: () => void;
}

export const useClear = ({ errorMessage, clearError }: UseClearProps) => {
  useEffect(() => {
    if (errorMessage && clearError) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);
}