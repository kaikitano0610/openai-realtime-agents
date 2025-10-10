"use client";

import React, {
  createContext,
  useContext,
  useState,
  FC,
  PropsWithChildren,
  useCallback, // useCallbackをインポート
} from "react";
import { v4 as uuidv4 } from "uuid";
import { TranscriptItem } from "@/app/types";

type TranscriptContextValue = {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (
    itemId: string,
    role: "user" | "assistant",
    text: string,
    isHidden?: boolean,
  ) => void;
  updateTranscriptMessage: (itemId: string, text: string, isDelta: boolean) => void;
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
  updateTranscriptItem: (itemId: string, updatedProperties: Partial<TranscriptItem>) => void;
  clearTranscript: () => void;
};

const TranscriptContext = createContext<TranscriptContextValue | undefined>(undefined);

export const TranscriptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  // タイムスタンプ生成関数は変更なし
  function newTimestampPretty(): string {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    return `${time}.${ms}`;
  }

  // addTranscriptMessageなどの既存関数も、念のためuseCallbackで囲んで安定させる
  const addTranscriptMessage: TranscriptContextValue["addTranscriptMessage"] = useCallback((itemId, role, text = "", isHidden = false) => {
    setTranscriptItems((prev) => {
      if (prev.some((log) => log.itemId === itemId && log.type === "MESSAGE")) {
        console.warn(`[addTranscriptMessage] skipping; message already exists for itemId=${itemId}, role=${role}, text=${text}`);
        return prev;
      }
      const newItem: TranscriptItem = {
        itemId, type: "MESSAGE", role, title: text, expanded: false,
        timestamp: newTimestampPretty(), createdAtMs: Date.now(), status: "IN_PROGRESS", isHidden,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateTranscriptMessage: TranscriptContextValue["updateTranscriptMessage"] = useCallback((itemId, newText, append = false) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId && item.type === "MESSAGE") {
          return { ...item, title: append ? (item.title ?? "") + newText : newText };
        }
        return item;
      })
    );
  }, []);

  const addTranscriptBreadcrumb: TranscriptContextValue["addTranscriptBreadcrumb"] = useCallback((title, data) => {
    setTranscriptItems((prev) => [
      ...prev,
      {
        itemId: `breadcrumb-${uuidv4()}`, type: "BREADCRUMB", title, data, expanded: false,
        timestamp: newTimestampPretty(), createdAtMs: Date.now(), status: "DONE", isHidden: false,
      },
    ]);
  }, []);

  const toggleTranscriptItemExpand: TranscriptContextValue["toggleTranscriptItemExpand"] = useCallback((itemId) => {
    setTranscriptItems((prev) => prev.map((log) => (log.itemId === itemId ? { ...log, expanded: !log.expanded } : log)));
  }, []);

  const updateTranscriptItem: TranscriptContextValue["updateTranscriptItem"] = useCallback((itemId, updatedProperties) => {
    setTranscriptItems((prev) => prev.map((item) => (item.itemId === itemId ? { ...item, ...updatedProperties } : item)));
  }, []);

  // clearTranscriptをuseCallbackで囲み、関数が再生成されないようにする
  const clearTranscript = useCallback(() => {
    setTranscriptItems([]);
  }, []);

  return (
    <TranscriptContext.Provider
      value={{
        transcriptItems,
        addTranscriptMessage,
        updateTranscriptMessage,
        addTranscriptBreadcrumb,
        toggleTranscriptItemExpand,
        updateTranscriptItem,
        clearTranscript,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

export function useTranscript() {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error("useTranscript must be used within a TranscriptProvider");
  }
  return context;
}