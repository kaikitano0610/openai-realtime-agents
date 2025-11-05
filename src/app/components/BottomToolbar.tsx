import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isEvaluating?: boolean; // 評価機能に必要なプロパティのみ残す
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isEvaluating = false,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  function getConnectionButtonLabel() {
    if (isEvaluating) return "評価中...";
    if (isConnected) return "セッション終了";
    if (isConnecting) return "接続中...";
    return "セッション開始";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "text-white text-base p-2 w-36 rounded-md h-full";
    const cursorClass = (isConnecting || isEvaluating) ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      if (isEvaluating) {
        return `bg-gray-500 ${cursorClass} ${baseClasses}`;
      }
      return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
    }
    return `bg-black hover:bg-gray-900 ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="p-4 flex flex-row items-center justify-center gap-x-8">
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting || isEvaluating}
      >
        {getConnectionButtonLabel()}
      </button>
    </div>
  );
}

export default BottomToolbar;