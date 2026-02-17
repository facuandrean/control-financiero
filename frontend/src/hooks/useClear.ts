import { useEffect } from "react";

interface UseClearProps {
  message?: string;
  clearMessage: () => void;
}

export const useClear = ({ message, clearMessage }: UseClearProps) => {
  useEffect(() => {
    if (message && clearMessage) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);
}