import { useEffect } from "react";

interface UseClearProps {
  message?: string | null;
  clearMessage: () => void;
  time?: number;
}

export const useClear = ({ message, clearMessage, time = 3000 }: UseClearProps) => {
  useEffect(() => {
    if (message && clearMessage) {
      const timer = setTimeout(() => {
        clearMessage();
      }, time);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage, time]);
};