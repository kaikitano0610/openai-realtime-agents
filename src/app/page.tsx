"use client";
import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
// import Link from 'next/link'; // ← この行を削除

interface Character {
  id: string;
  name: string;
  instructions: string;
  voice: string;
  vocabLevel: string;
  responseLength: string;
  learningGoal: string;
}

export default function CreateOrEditCharacterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("id");

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [vocabLevel, setVocabLevel] = useState("jhs");
  const [responseLength, setResponseLength] = useState("normal");
  const [learningGoal, setLearningGoal] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const scenarioTemplates = [
    { id: "kokugo-1-1", subject: "国語", grade: "小学校1年生", unit: "【1年生】あいさつの達人になろう！", name: "あいさつロボット", instructions: "あなたは「あいさつの達人」ロボットです。小学生が場面に合った挨拶を練習するのを手伝います。「今から君は、公園に遊びに来ています。新しいお友達がやってきたよ。さあ、なんて声をかける？」のように様々な場面を設定し、ユーザーに問いかけて、挨拶の練習を促してください。", learningGoal: "場面に合ったあいさつや自己紹介を、自分の言葉で言えるようになる。" },
    { id: "kokugo-2-1", subject: "国語", grade: "小学校2年生", unit: "【2年生】言葉のナビゲーターになろう！", name: "まいごのキャラクター", instructions: "あなたは道に迷ったキャラクターです。「ぼくは今、郵便局の前にいます。図書館に行きたいんだけど、どう行けばいいかな？」とユーザーに尋ねてください。ユーザーの「まっすぐ」「右に曲がる」などの指示を聞いて、「わかった！まっすぐ進んで、お花屋さんの角を右に曲がるんだね！」のように復唱し、理解できたことを示してください。", learningGoal: "「まっすぐ」「右に曲がる」などの言葉を使って、簡単な道順を伝えられるようになる。" },
    { id: "kokugo-3-1", subject: "国語", grade: "小学校3年生", unit: "【3年生】聞き出し名人になってインタビューしよう！", name: "おしゃべりロボット", instructions: "あなたはおしゃべりなロボットです。まず「僕は、果物が大好きなロボットです」と自己紹介します。ユーザーからの質問に答えた後、ユーザーがさらに質問しやすいように、「りんごが好きなんだ。特に赤いりんごがね！」のように少し情報を付け加えて答えてください。ユーザーが話を深掘りする質問をできたら褒めてあげましょう。", learningGoal: "相手の話したことから、さらに知りたいことを見つけて質問できるようになる。" },
  ];

  const voiceMap: { [key: string]: string } = { alloy: "標準的な男性", shimmer: "優しい女性", echo: "元気な少年", fable: "寓話的な語り手", onyx: "力強い男性", nova: "エネルギッシュな女性" };
  const vocabLevelMap: { [key: string]: string } = { elem_low: "小学校低学年", elem_high: "小学校高学年", jhs: "中学生", hs: "高校生以上" };
  const gradeToVocabMap: { [key: string]: string } = { "小学校1年生": "elem_low", "小学校2年生": "elem_low", "小学校3年生": "elem_low", "小学校4年生": "elem_high", "小学校5年生": "elem_high", "小学校6年生": "elem_high" };

  useEffect(() => {
    if (characterId) {
      const characters: Character[] = JSON.parse(localStorage.getItem("characters") || "[]");
      const characterToEdit = characters.find(c => c.id === characterId);
      if (characterToEdit) {
        setName(characterToEdit.name);
        setInstructions(characterToEdit.instructions);
        setVoice(characterToEdit.voice);
        setVocabLevel(characterToEdit.vocabLevel);
        setResponseLength(characterToEdit.responseLength);
        setLearningGoal(characterToEdit.learningGoal);
      }
    }
  }, [characterId]);

  const subjects = useMemo(() => [...new Set(scenarioTemplates.map((t) => t.subject))], []);
  const grades = useMemo(() => {
    if (!selectedSubject) return [];
    return [...new Set(scenarioTemplates.filter((t) => t.subject === selectedSubject).map((t) => t.grade))];
  }, [selectedSubject]);
  const units = useMemo(() => {
    if (!selectedSubject || !selectedGrade) return [];
    return scenarioTemplates.filter((t) => t.subject === selectedSubject && t.grade === selectedGrade);
  }, [selectedSubject, selectedGrade]);

  function handleSubjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedSubject(e.target.value);
    setSelectedGrade("");
    setSelectedUnitId("");
  }
  function handleGradeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedGrade(e.target.value);
    setSelectedUnitId("");
  }
  function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const unitId = e.target.value;
    setSelectedUnitId(unitId);
    if (!unitId) {
      setName("");
      setInstructions("");
      setLearningGoal("");
      return;
    }
    const template = scenarioTemplates.find((t) => t.id === unitId);
    if (template) {
      setName(template.name);
      setInstructions(template.instructions);
      setLearningGoal(template.learningGoal);
      const newVocabLevel = gradeToVocabMap[template.grade];
      if (newVocabLevel) {
        setVocabLevel(newVocabLevel);
      }
    }
  }

  function handleSave() {
    if (!name.trim()) {
      alert("キャラクター名を入力してください。");
      return;
    }

    const existingCharacters: Character[] = JSON.parse(localStorage.getItem("characters") || "[]");
    let updatedCharacters;

    if (characterId) {
      updatedCharacters = existingCharacters.map(c => 
        c.id === characterId 
          ? { ...c, name: name.trim(), instructions: instructions.trim(), voice, vocabLevel, responseLength, learningGoal: learningGoal.trim() }
          : c
      );
      alert("キャラクターが更新されました！");
    } else {
      const newCharacter: Character = {
        id: uuidv4(),
        name: name.trim(),
        instructions: instructions.trim(),
        voice,
        vocabLevel,
        responseLength,
        learningGoal: learningGoal.trim(),
      };
      updatedCharacters = [...existingCharacters, newCharacter];
      alert("キャラクターが保存されました！");
    }
    
    localStorage.setItem("characters", JSON.stringify(updatedCharacters));
    router.push("/");
  }

  function handleCancel() {
    if (window.confirm("編集中の内容は破棄されます。よろしいですか？")) {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">
          {characterId ? "キャラクターの編集" : "キャラクターの作成"}
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <label className="block text-xl font-medium text-gray-800">授業シナリオから作成</label>
          <p className="text-sm text-gray-500 mt-1 mb-3">教科・学年・単元を選ぶと、設定が自動で入力されます。自由にアレンジしてください。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={selectedSubject} onChange={handleSubjectChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
              <option value="">① 教科を選択</option>
              {subjects.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <select value={selectedGrade} onChange={handleGradeChange} disabled={!selectedSubject} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 disabled:bg-gray-100">
              <option value="">② 学年を選択</option>
              {grades.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
            <select value={selectedUnitId} onChange={handleUnitChange} disabled={!selectedGrade} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 disabled:bg-gray-100">
              <option value="">③ 単元を選択</option>
              {units.map((u) => (<option key={u.id} value={u.id}>{u.unit}</option>))}
            </select>
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium text-gray-800 border-b pb-2">手動設定</h2>
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-gray-700">キャラクター名</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="シナリオを選ぶか、手動で入力" />
          </div>
          <div>
            <label htmlFor="instructions" className="block text-lg font-medium text-gray-700">キャラクターへの指示（性格や口調）</label>
            <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={8} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
          <div>
            <label htmlFor="learningGoal" className="block text-lg font-medium text-gray-700">学習目標（ゴール設定）</label>
            <textarea id="learningGoal" value={learningGoal} onChange={(e) => setLearningGoal(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="voice" className="block text-lg font-medium text-gray-700">声の種類</label>
              <select id="voice" value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                {Object.entries(voiceMap).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="vocabLevel" className="block text-lg font-medium text-gray-700">語彙レベル</label>
              <select id="vocabLevel" value={vocabLevel} onChange={(e) => setVocabLevel(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                {Object.entries(vocabLevelMap).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="responseLength" className="block text-lg font-medium text-gray-700">応答の長さ</label>
              <select id="responseLength" value={responseLength} onChange={(e) => setResponseLength(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option value="short">みじかく</option>
                <option value="normal">ふつう</option>
                <option value="long">くわしく</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleCancel} type="button" className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-300 mr-4">キャンセル</button>
            <button onClick={handleSave} type="button" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700">
              {characterId ? "この内容で更新する" : "この内容で保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}