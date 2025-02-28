import { readFileSync } from "fs";
import path from "path";
// import * as pdfjsLib from "pdfjs-dist";
import chromaClient from "./utils/chromaClient";

// const getFileContent = async (filePath: string) => {
//   const data = new Uint8Array(readFileSync(filePath));
//   const doc = await pdfjsLib.getDocument(data).promise;
//   const page = await doc.getPage(1);
//   const content = await page.getTextContent();
//   const text = content.items.map((item) => item.str).join("");

//   return text;
// };

// const chroma = async () => {
//   try {
//     // const content = await getFileContent(
//     //   path.join(__dirname, "./assets/Resume.pdf")
//     // );
//     const collection = await chromaClient.getOrCreateCollection({
//       name: "ai-engineering-basics",
//     });

//     await collection.upsert({
//       ids: ["id1", "id2"],
//       documents: [
//         "This is a document about pineapple",
//         "This is a document about oranges",
//       ],
//     });

//     const results = await collection.query({
//       queryTexts: "This is a query document about florida",
//       nResults: 2,
//     });

//     console.log(results);
//   } catch (error) {
//     console.error(error);
//   }
// };

// chroma();

import ollama from "ollama";

const prompt = "The sky is blue because of rayleigh scattering";

const res = await ollama.embeddings({
  model: "nomic-embed-text",
  prompt,
});

const vector = res.embedding;

const chat = await ollama.chat({
  model: "llama3",
  messages: [{ role: "user", content: "hello" }],
});

console.log(vector);

// const collection = await chromaClient.getOrCreateCollection({
//   name: "ai-engineering-basics",
// });

// await collection.add({
//   ids: ["1"],
//   embeddings: [res.embedding], // Manually adding precomputed embeddings
//   metadatas: [{ text: prompt }],
// });
