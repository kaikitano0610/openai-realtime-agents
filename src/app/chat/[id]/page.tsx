"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Transcript from "@/app/components/Transcript";
import Events from "@/app/components/Events";
import BottomToolbar from "@/app/components/BottomToolbar";

import { SessionStatus } from "@/app/types";
import { RealtimeAgent } from '@openai/agents/realtime';

import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useRealtimeSession } from "@/app/hooks/useRealtimeSession";
import useAudioDownload from "@/app/hooks/useAudioDownload";
import { useHandleSessionHistory } from "@/app/hooks/useHandleSessionHistory";

interface Character {
  id: string;
  name: string;
  instructions: string;
  voice: string;
  learningGoal?: string;
}

function ChatPage() {
  const params = useParams();
  const { id } = params;

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [userText, setUserText] = useState<string>("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{ score: number, reason: string } | null>(null);

  const { transcriptItems, addTranscriptBreadcrumb, clearTranscript } = useTranscript();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      const storedCharacters = localStorage.getItem('characters');
      if (storedCharacters) {
        const characters: Character[] = JSON.parse(storedCharacters);
        const selectedChar = characters.find(c => c.id === id);
        setCharacter(selectedChar || null);
      }
    }
    // ページが開かれた時、またはキャラクターが変わった時にログをクリア
    clearTranscript();
  }, [id, clearTranscript]);

  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  const { connect, disconnect, sendUserText, sendEvent } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
  });

  const { startRecording, stopRecording, downloadRecording } = useAudioDownload();
  useHandleSessionHistory();

  const fetchEphemeralKey = async (): Promise<string> => {
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    if (!data.client_secret?.value) {
      throw new Error("No ephemeral key provided by the server");
    }
    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED" || !character) return;
    setSessionStatus("CONNECTING");
    setEvaluationResult(null);

    try {
      const agentFromCharacter = new RealtimeAgent({
        name: character.name.replace(/\s/g, '_'),
        instructions: character.instructions,
        voice: character.voice,
        handoffs: [],
        tools: [],
        handoffDescription: "",
      });

      await connect({
        getEphemeralKey: fetchEphemeralKey,
        initialAgents: [agentFromCharacter],
        audioElement: sdkAudioElement,
      });

      addTranscriptBreadcrumb(`Agent: ${agentFromCharacter.name}`, agentFromCharacter);
      sendEvent({
        type: 'session.update',
        session: {
          turn_detection: {
            type: 'server_vad',
            silence_duration_ms: 600,
            create_response: true,
          }
        },
      });

    } catch (err) {
      console.error("Error connecting via SDK:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectAndEvaluate = async () => {
    if (!character?.learningGoal || transcriptItems.filter(item => item.type === 'MESSAGE').length === 0) {
      disconnect();
      return;
    }

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: transcriptItems, learningGoal: character.learningGoal }),
      });
      const result = await response.json();
      setEvaluationResult(result);
    } catch (error) {
      console.error("Evaluation failed:", error);
      alert("評価の取得に失敗しました。");
    } finally {
      setIsEvaluating(false);
      disconnect();
    }
  };

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    try {
      sendUserText(userText.trim());
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
    setUserText("");
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectAndEvaluate();
    } else {
      connectToRealtime();
    }
  };
  
  useEffect(() => {
    if (sessionStatus === "CONNECTED" && audioElementRef.current?.srcObject) {
      const remoteStream = audioElementRef.current.srcObject as MediaStream;
      startRecording(remoteStream);
    }
    return () => {
      stopRecording();
    };
  }, [sessionStatus]);

  if (!character) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 mb-4">キャラクターが見つかりません。</p>
                <Link href="/" className="text-blue-600 hover:underline">ホームに戻る</Link>
            </div>
        </div>
    );
  }

  const handleResetTranscript = () => {
    if (window.confirm("このキャラクターとの会話ログをリセットします。よろしいですか？")) {
      clearTranscript();
    }
  }

  return (
    <div className="text-base flex flex-col h-screen bg-gray-100 text-gray-800 relative">
       {evaluationResult && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">会話の評価</h2>
            <div className="text-center mb-6">
              <p className="text-lg">学習目標の達成度は...</p>
              <p className="text-7xl font-bold my-4 text-blue-600">{evaluationResult.score}<span className="text-3xl">点</span></p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">評価の理由：</h3>
              <p className="bg-gray-100 p-4 rounded-md">{evaluationResult.reason}</p>
            </div>
            <button
              onClick={() => setEvaluationResult(null)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div className="p-5 text-lg font-semibold flex justify-between items-center">
        <Link href="/" className="flex items-center cursor-pointer gap-4">
          <Image
            src="/openai-logomark.svg"
            alt="OpenAI Logo"
            width={20}
            height={20}
          />
          <div>{character.name} とのチャット</div>
        </Link>
        <div className="flex items-center gap-4">
            <div className="text-sm font-normal text-gray-600 max-w-md truncate">
                学習目標: {character.learningGoal || "設定されていません"}
            </div>
             <button onClick={handleResetTranscript} className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                ログをリセット
             </button>
        </div>
      </div>

      <div className="flex flex-1 gap-2 px-2 overflow-hidden relative">
        <Transcript
          userText={userText}
          setUserText={setUserText}
          onSendMessage={handleSendTextMessage}
          downloadRecording={downloadRecording}
          canSend={sessionStatus === "CONNECTED"}
        />
        <Events isExpanded={false} />
      </div>

      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={false}
        setIsPTTActive={() => {}}
        isPTTUserSpeaking={false}
        handleTalkButtonDown={() => {}}
        handleTalkButtonUp={() => {}}
        isEventsPaneExpanded={false}
        setIsEventsPaneExpanded={() => {}}
        isAudioPlaybackEnabled={true}
        setIsAudioPlaybackEnabled={() => {}}
        codec={"opus"}
        onCodecChange={() => {}}
        isEvaluating={isEvaluating}
      />
    </div>
  );
}

export default ChatPage;