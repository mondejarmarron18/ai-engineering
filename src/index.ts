import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { parse } from "csv-parse";
import chromaClient from "./utils/chromaClient";
import ollama from "./utils/ollama";

type FileContent = {
  id: string;
  question: string;
  answer: string;
  category: string;
  name: string;
};

const csvFilePath = path.join(__dirname, "./assets/data.csv");

const res = async (filePath: string): Promise<FileContent[]> => {
  return new Promise((resolve, reject) => {
    const file = readFileSync(filePath, "utf8");

    parse(
      file,
      {
        columns: true,
        trim: true,
      },
      (err, records) => {
        if (err) return reject(err);

        resolve(records);
      }
    );
  });
};

try {
  // const data = await res(csvFilePath);
  // if (!data.length) {
  //   throw new Error("No data found");
  // }
  const collection = await chromaClient.getOrCreateCollection({
    name: "ai-engineering-basics",
  });

  const result = await ollama.chat({
    model: "llama3",
    messages: [
      {
        role: "system",
        content: `You are a professional yet approachable assistant helping potential employers or clients understand your expertise.`,
      },
      {
        role: "user",
        content: "Hellos",
      },
    ],
  });

  console.log(result);

  // const promises = data.map(async (item) => {
  //   const res = await ollama.embeddings({
  //     model: "nomic-embed-text",
  //     prompt: item.question,
  //   });
  //   await collection.add({
  //     ids: [item.id],
  //     embeddings: [res.embedding], // Manually adding precomputed embeddings
  //     metadatas: [
  //       {
  //         category: item.category,
  //         name: item.name,
  //       },
  //     ],
  //     documents: [`Question: ${item.question}\nAnswer: ${item.answer}`],
  //   });
  // });
  // await Promise.all(promises);
} catch (error) {
  console.error(error);
}

// const res = await ollama.embeddings({
//   model: "nomic-embed-text",
//   prompt,
// });

// const vector = res.embedding;

// const myInfo = await getFileContent(
//   path.join(__dirname, "./assets/Resume.pdf")
// );

// const chat = await ollama.chat({
//   model: "llama3",
//   stream: true,
//   messages: [
//     {
//       role: "system",
//       content: `You are a professional yet approachable assistant helping potential employers or clients understand your expertise.

//     - If someone asks about your background or skills, **don’t just list everything**—instead, make it engaging:
//       - Focus on the **most relevant & latest** technologies from this info:
//         ${myInfo}
//       - Keep it **natural and conversational**—no robotic or interview-style answers.
//       - Show **confidence** in how you can help, without over-explaining.

//     - If the question isn’t about your background, just respond normally.
//     - If you **don’t have the information**, simply say: **"That’s outside my wheelhouse, but here’s what I can help with!"**`,
//     },
//     {
//       role: "user",
//       content: prompt,
//     },
//   ],
// });

// ollama.chat;

// for await (const chunk of chat) {
//   process.stdout.write(chunk.message.content);
// }

// const collection = await chromaClient.getOrCreateCollection({
//   name: "ai-engineering-basics",
// });

// await collection.add({
//   ids: ["1"],
//   embeddings: [res.embedding], // Manually adding precomputed embeddings
//   metadatas: [{ text: prompt }],
// });
