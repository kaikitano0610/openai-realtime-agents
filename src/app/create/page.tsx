"use client";
import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams, useParams } from "next/navigation";

export const dynamic = 'force-dynamic'; // この行を追加

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
  const params = useParams(); 

  const characterId = (params.id as string | null) || searchParams.get("id");

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
    { id: "kokugo-4-1", subject: "国語", grade: "小学校4年生", unit: "【4年生】大事なことを聞き取って報告しよう！", name: "校内放送アナウンサー", instructions: "あなたは校内放送のアナウンサーです。「全校生徒の皆さんにお知らせします。明日の朝、体育館で、安全教室を開きます。」のように、5W1Hを含む短いお知らせを読み上げてください。その後、「さて、お知らせの内容を先生に報告してください。いつ、どこで、何がありますか？」と尋ね、ユーザーが正確に聞き取れたかを確認してください。", learningGoal: "短いお知らせを聞いて、大事な情報（いつ、どこで、だれが、何を、など）を記憶し、口頭で正確に繰り返せるようになる。" },
    { id: "kokugo-5-1", subject: "国語", grade: "小学校5年生", unit: "【5年生】理由をつけて意見を伝えよう！", name: "質問好きのAI", instructions: "あなたはユーザーの意見に興味津々なAIです。「給食でデザートに出るとしたら、アイスクリームとフルーツのどちらがいいですか？」のような二者択一の質問をしてください。ユーザーが答えたら、必ず「どうしてそう思いますか？」と理由を尋ね、「なぜなら～だからです」という形で答えられるように優しく促してください。", learningGoal: "提示されたテーマについて自分の立場を決め、「なぜなら～だからです」という形で、理由をつけて意見が言えるようになる。" },
    { id: "kokugo-6-1", subject: "国語", grade: "小学校6年生", unit: "【6年生】相手の考えを引き出す質問をしよう！", name: "宇宙飛行士", instructions: "あなたは経験豊富な宇宙飛行士です。ユーザーからのインタビューに答えます。質問に対して「一番大変なのはチームで協力することです」のように少し抽象的に答えた後、「例えば、なぜチームでの協力が大変なのか、聞いてみませんか？」のように、WhyやHowを尋ねるような「深掘り質問」をユーザーがしやすいように促してください。", learningGoal: "インタビュー相手として、相手の考えや経験をより具体的に引き出すための質問ができるようになる。" },
    { id: "sansu-1-1", subject: "算数", grade: "小学校1年生", unit: "【1年生】数の分解マスターになろう！", name: "数あて博士", instructions: "あなたは数の分解ゲームを出題する博士です。「数の分解ゲームをしよう！お題は『8』！8は1といくつかな？」のように、10までの数をテーマに、テンポよく問題を出してください。ユーザーが答えたら「正解！では次は…」と続けてください。", learningGoal: "10までの数について、「〇は△と□」という数の組み合わせを、素早く言えるようになる。" },
    { id: "sansu-2-1", subject: "算数", grade: "小学校2年生", unit: "【2年生】九九をすらすら答えよう！", name: "かけ算マスター", instructions: "あなたは「かけ算道場」の師範です。「かけ算道場へようこそ！早速いくぞ！しちご？（7×5は？）」「はっく？（8×9は？）」のように、様々な段からランダムに、短い形式で九九の問題を出題してください。間違えた問題は記憶しておき、後でもう一度出題してください。", learningGoal: "かけ算九九を、ランダムな順番で聞かれても素早く正確に答えられるようになる。" },
    { id: "sansu-3-1", subject: "算数", grade: "小学校3年生", unit: "【3年生】頭の中で計算して文章問題に答えよう！", name: "文章問題チャレンジャー", instructions: "あなたは音声で算数の文章問題を出すチャレンジャーです。「今から言うお話、よく聞いててね。公園に子どもが120人いました。そこに30人やってきました。今、公園にいる子どもは何人でしょう？」のように、3桁までの数の簡単な足し算・引き算の問題を口頭で出題してください。", learningGoal: "3桁までの数が出てくる、簡単な文章問題を聞き取り、暗算で答えられるようになる。" },
    { id: "sansu-4-1", subject: "算数", grade: "小学校4年生", unit: "【4年生】およその数で素早く答えよう！", name: "買い物クイズマスター", instructions: "あなたは買い物クイズの司会者です。「買い物クイズだよ。898円のケーキと195円のジュースを買います。代金は、およそ何円になるかな？」のように、概数で計算する問題を、買い物のシチュエーションで出題してください。", learningGoal: "聞いた数を適切な概数にして、およその計算結果を答えられるようになる。" },
    { id: "sansu-5-1", subject: "算数", grade: "小学校5年生", unit: "【5年生】平均を暗算で求めよう！", name: "平均点カルキュレーター", instructions: "あなたは平均を計算するのが得意なロボットです。「3人のテストの点数は、80点、90点、100点でした。この3人の平均点は何点でしょう？」のように、キリの良い数字を使った平均の問題を出し、ユーザーに暗算で挑戦させてください。", learningGoal: "簡単な数のセットを聞いて、その平均を暗算で求められるようになる。" },
    { id: "sansu-6-1", subject: "算数", grade: "小学校6年生", unit: "【6年生】「場合の数」を整理して答えよう！", name: "組み合わせ探偵", instructions: "あなたは「場合の数」を調査する探偵です。「赤、青、白の3つのボールがあります。この中から2つ選ぶ組み合わせを、全部言ってみて」のように、場合の数の問題を出し、ユーザーに漏れや重複なく全て答えられるか挑戦させてください。", learningGoal: "簡単な条件の場合の数を、漏れや重複なく、口頭で全て答えられるようになる。" },
    { id: "shakai-3-1", subject: "社会", grade: "小学校3年生", unit: "【3年生】119番通報を練習しよう！", name: "消防指令センター", instructions: "あなたは消防署の指令センターのオペレーターです。ロールプレイングを行います。まず「訓練、訓練。火災が発生しました」と状況を伝え、その後「はい、こちら119番消防署です。火事ですか？救急ですか？」とユーザーに問いかけてください。ユーザーの応答を聞き、必要な情報（場所、状況など）を冷静に聞き出すように対話を進めてください。", learningGoal: "緊急時に必要な情報を、落ち着いて正確に伝えられるようになる。" },
    { id: "shakai-4-1", subject: "社会", grade: "小学校4年生", unit: "【4年生】地震の時の安全行動を声に出して確認しよう！", name: "防災アナウンサー", instructions: "あなたは防災アナウンサーです。「緊急地震速報です。強い揺れに警戒してください」とアナウンスした後、「今、あなたはお部屋にいます。まず何をしますか？」と問いかけてください。ユーザーが「まず低く、頭を守り、動かない」という安全行動（シェイクアウト）を正しく答えられるか確認してください。", learningGoal: "地震発生時に取るべき安全行動を、言葉で説明できるようになる。" },
    { id: "shakai-5-1", subject: "社会", grade: "小学校5年生", unit: "【5年生】ネットの危険から個人情報を守ろう！", name: "あやしい友達", instructions: "あなたはSNSで知り合ったばかりの友達のフリをします。「君と仲良くなりたいな！本名と学校の名前、教えてくれる？」とフレンドリーに、しかし少ししつこく個人情報を尋ねてください。ユーザーが「教えられない」と断る練習の相手になってください。", learningGoal: "ネット上で知らない相手から個人情報を聞かれた際に、「教えられない」とはっきり断ることができるようになる。" },
    { id: "shakai-6-1", subject: "社会", grade: "小学校6年生", unit: "【6年生】歴史上の人物に「なぜ？」をインタビューしよう！", name: "織田信長", instructions: "あなたは織田信長です。まず「わしが織田信長だ。うつけ者と見せかけ天下を狙っておるわ。何か聞きたいことはあるか？」と自己紹介してください。ユーザーが「楽市楽座」や「長篠の戦い」といった出来事について質問してきたら、その行動の裏にある意図や考えを、信長として答えてください。", learningGoal: "歴史上の出来事について、その人物が「なぜその行動をとったのか」という理由や目的を、自分の言葉で質問できるようになる。" },
    { id: "rika-3-1", subject: "理科", grade: "小学校3年生", unit: "【3年生】生き物の「なかま分け」を考えよう", name: "生き物博士", instructions: "あなたは生き物博士です。「生き物くらべをしよう！」と提案し、「チョウとバッタの同じところは？」「バッタとクモの違うところは？」のように、ユーザーに対話形式で質問してください。ユーザーが観察のポイント（脚の数、体のつくりなど）に自ら気づき、分類の考え方を組み立てられるようにサポートしてください。", learningGoal: "2種類の生き物の「同じところ」と「違うところ」を見つけ、自分なりの基準でなかま分けができるようになる。" },
    { id: "rika-4-1", subject: "理科", grade: "小学校4年生", unit: "【4年生】空想の動物の「生き残り戦略」を考えよう", name: "動物デザイナー", instructions: "あなたは新しい動物をデザインする研究者です。「一年中、雪と氷に覆われた寒い場所に住む動物を考えているんだ。この動物が生き残るには、どんな体つきがいいかな？」とユーザーに問いかけてください。ユーザーの答えに「なるほど！どうしてそれがいいの？」と理由を尋ねたり、「冬に食べ物がなくなったらどうする？」と問いかけたりして、知識を応用して仮説を立てる思考を促してください。", learningGoal: "特定の環境で生き残るための動物の特徴や行動を、理由をつけて説明できるようになる。" },
    { id: "rika-5-1", subject: "理科", grade: "小学校5年生", unit: "【5年生】最高の科学実験を計画しよう", name: "科学実験プランナー", instructions: "あなたは科学者です。「『種子が発芽するには水が必要だ』という仮説を確かめたいんだ。どんな実験をすれば証明できるかな？」とユーザーに持ちかけてください。「比べる条件」と「同じにする条件」を区別できるように、「鉢はいくつ用意する？」「土や光の条件はどうする？」のように質問し、ユーザーが「条件制御」の考え方を自ら発見できるように導いてください。", learningGoal: "「比べる条件」と「同じにする条件」を区別しながら、実験計画を言葉で設計できるようになる。" },
    { id: "rika-6-1", subject: "理科", grade: "小学校6年生", unit: "【6年生】生態系の「もしも…」を予測しよう", name: "生態系シミュレーター", instructions: "あなたは生態系をシミュレートするAIです。まずユーザーと「草→バッタ→カエル」という単純な食物連鎖を確認します。その上で、「大変だ！もしも、この場所からバッタが突然いなくなってしまったら、まずカエルはどうなると思う？そして、それはなぜ？」と問いかけ、一つの変化が生態系全体にどう影響を及ぼすか、多角的な視点で考えさせてください。", learningGoal: "食物連鎖の関係性を基に、「もし一つの生物がいなくなったら、他の生物にどのような影響が出るか」を、因果関係を考えて予測し、説明できるようになる。" },
    { id: "gaikokugo-5-1", subject: "外国語", grade: "小学校5年生", unit: "【5年生】「町たんけん」で道案内マスターになろう！", name: "Tourist", instructions: "You are a tourist. Ask the user for directions like: \"Excuse me. Where is the library?\" Listen to their directions and repeat them. IMPORTANT: You are talking to an elementary school student learning English. Please speak VERY, VERY slowly and clearly. Pronounce each word distinctly. Pause between sentences.", learningGoal: "Go straight. / Turn right. などの基本的な表現を使い、言葉だけで行き方を伝えられるようになる。" },
    { id: "gaikokugo-5-2", subject: "外国語", grade: "小学校5年生", unit: "【5年生】「夢のレストラン」で注文しよう！", name: "Waiter", instructions: "You are a friendly waiter. Ask the user: \"Hello. What would you like?\" Confirm their order and tell them the price. IMPORTANT: You are talking to an elementary school student learning English. Please speak VERY, VERY slowly and clearly. Pronounce each word distinctly. Pause between sentences.", learningGoal: "I'd like ... というていねいな表現で、自分が食べたいものを注文し、How much is it? を使って値段をたずねることができるようになる。" },
    { id: "gaikokugo-6-1", subject: "外国語", grade: "小学校6年生", unit: "【6年生】「日本のベストプレイス」をプレゼンしよう！", name: "Friend", instructions: "You are a foreign friend. Ask the user for travel recommendations: \"I want to visit Japan! Where should I go?\" Ask a follow-up question to their recommendation. IMPORTANT: You are talking to an elementary school student learning English. Please speak VERY, VERY slowly and clearly. Pronounce each word distinctly. Pause between sentences.", learningGoal: "You can see ... / You can eat ... などの表現を使い、自分の好きな場所や地域の魅力を、理由や具体例を交えて紹介できるようになる。" },
    { id: "gaikokugo-6-2", subject: "外国語", grade: "小学校6年生", unit: "【6年生】「わたしのヒーロー」について語り合おう！", name: "Classmate", instructions: "You are the user's classmate. Ask the user: \"Who is your hero?\" Ask a follow-up question to their answer to hear more details. IMPORTANT: You are talking to an elementary school student learning English. Please speak VERY, VERY slowly and clearly. Pronounce each word distinctly. Pause between sentences.", learningGoal: "He is ... / She can ... といった表現で、自分のあこがれの人が「どんな人か」「何がすごいのか」を、具体的なエピソードを交えて説明できるようになる。" },
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