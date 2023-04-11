const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors()); // CORSミドルウェアを追加

// const API_KEY = process.env.CHATGPT_API_KEY; // 環境変数からAPIキーを取得
const API_KEY = "";
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

  let messages_array = [];

  // メッセージを作成して配列に追加
  for (const element of content_textArray) {
    messages_array.push({ role: "user", content: element });
  }
  messages_array.push({
    role: "user",
    content: "これまで私が投げた内容をすべて要約してください。100文字以内で",
  });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: content_textArray,
  });
  // console.log("================", completion.data.choices[0].message);

  console.log("================");
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
  // try {
  const answer = ask(req.body.question);
  // res.json({ answer: answer });
  // } catch (error) {
  //   // console.error(error); // エラーをコンソールに出力
  //   res
  //     .status(500)
  //     .json({ message: "Error sending question", details: error.message }); // エラーの詳細をクライアントに返す
  // }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
