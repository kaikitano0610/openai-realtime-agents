import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
  isEvaluating?: boolean;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
  isEvaluating = false,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  function getConnectionButtonLabel() {
    if (isEvaluating) return "評価中...";
    if (isConnected) return "セッション終了"; // "Disconnect"から変更
    if (isConnecting) return "接続中..."; // "Connecting..."から変更
    return "セッション開始"; // "Connect"から変更
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

      {/* 以下は簡略化のため非表示 */}
      <div className="hidden">
          <input id="push-to-talk" type="checkbox" />
          <label htmlFor="push-to-talk">Push to talk</label>
          <button>Talk</button>
          <input id="audio-playback" type="checkbox" />
          <label htmlFor="audio-playback">Audio playback</label>
          <input id="logs" type="checkbox" />
          <label htmlFor="logs">Logs</label>
          <select id="codec-select" value={codec} onChange={handleCodecChange}>
            <option value="opus">Opus (48 kHz)</option>
          </select>
      </div>
    </div>
  );
}

export default BottomToolbar;