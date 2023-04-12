const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors()); // CORSミドルウェアを追加

// const API_KEY = process.env.CHATGPT_API_KEY; // 環境変数からAPIキーを取得
// const API_KEY = "";
require("dotenv").config();
const API_KEY = process.env.API_KEY;

// import { Configuration, OpenAIApi } from "openai";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

// app.post("/api/chatgpt", async (req, res) => {
//   try {
//     const question = req.body.question;

//     const response = await axios.post(
//       "https://api.openai.com/v1/engines/davinci-codex/completions",
//       {
//         prompt: question,
//         max_tokens: 50,
//         n: 1,
//         stop: null,
//         temperature: 0.5,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const answer = response.data.choices[0].text.trim();
//     res.json({ answer: answer });
//   } catch (error) {
//     res.status(500).json({ message: "Error sending question" });
//   }
// });

// app.use(
//   cors({
//     origin: "https://localhost:3000",
//     credentials: true,
//   })
// );
// app.listen(3000, () => console.log("Server is running on port 3000"));

async function sendPrompt(prompt = "") {
  // promptがない場合
  if (!prompt) return;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      // 'model': 'text-curie-001', // 動作テスト用（料金的に）
      prompt: prompt,
      max_tokens: 150, // 出力される文章量の最大値（トークン数） max:4096
      temperature: 1, // 単語のランダム性 min:0.1 max:2.0
      top_p: 1, // 単語のランダム性 min:-2.0 max:2.0
      frequency_penalty: 0.0, // 単語の再利用 min:-2.0 max:2.0
      presence_penalty: 0.6, // 単語の再利用 min:-2.0 max:2.0
      stop: [" Human:", " AI:"], // 途中で生成を停止する単語
    }),
  });

  const data = await response.json();
  console.log(data.choices[0].text.trim());
  return data.choices[0].text.trim();
}

function splitLongText(text) {
  const maxLength = 300; // 分割する文字列の最大長さ
  const textArray = []; // 分割後の文字列を格納する配列
  for (let i = 0; i < text.length; i += maxLength) {
    textArray.push(text.substring(i, i + maxLength));
  }

  return textArray;
}

async function ask(content) {
  const content_textArray = splitLongText(content);

  for (const element of content_textArray) {
    sendPrompt(element);
  }

  const data = sendPrompt(
    "これまで私が投げた内容をすべて要約してください。100文字以内で"
  );
  return data;
  // メッセージを作成して配列に追加
  // for (const element of content_textArray) {
  //   messages_array.push({ role: "user", content: element });
  // }

  // 質問をAPIに送信し、回答を取得する
  // const answerPromises = content_textArray.map((q) =>
  //   openai.complete({
  //     engine: "davinci",
  //     maxTokens: 500,
  //   })
  // );

  // Promise.all(answerPromises)
  //   .then((answers) => {
  //     // 取得した回答を出力する
  //     console.log(answers);
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });

  // messages_array.push({
  //   role: "user",
  //   content: "これまで私が投げた内容をすべて要約してください。100文字以内で",
  // });

  // const completion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: content_textArray,
  // });
  // console.log("================", completion.data.choices[0].message);

  // console.log("================");
  //   //   const response = await openai.createChatCompletion({
  //   //     model: "gpt-3.5-turbo",
  //   //     messages: [{ role: "user", content }],
  //   //   });
  //   console.log(
  //     "=================================================",
  //     completion.data.choices[0].message
  //   );
  //   return completion.data.choices[0].message;
}

app.post("/api/chatgpt", async (req, res) => {
  try {
    const answer = ask(req.body.question);
    res.json({ answer: answer });
  } catch (error) {
    // console.error(error); // エラーをコンソールに出力
    res
      .status(500)
      .json({ message: "Error sending question", details: error.message }); // エラーの詳細をクライアントに返す
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
