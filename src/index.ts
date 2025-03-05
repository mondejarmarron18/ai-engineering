import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { parse } from "csv-parse";
import chromaClient from "./utils/chromaClient";
import { type ChatRequest } from "ollama";
import ollama from "./utils/ollama";
import { Ollama } from "@langchain/ollama";
import type { AddRecordsParams, Collection } from "chromadb";
import { x8tAsync, x8tSync } from "x8t";
import axios from "axios";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

type FileContent = {
  id: string;
  question: string;
  answer: string;
  category: string;
  name: string;
};

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
  __dirname,
  "../googleServiceAccountKey.json"
);
const textToSpeech = new TextToSpeechClient();

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

const query = async (prompt: string, collection: Collection) => {
  const { embedding } = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt,
  });

  return collection.query({
    queryEmbeddings: [embedding],
    nResults: 2,
  });
};

const newOllama = new Ollama({
  model: "llama3",
  temperature: 0.2,
  maxRetries: 2,
});

const { result: collection } = await x8tAsync(
  chromaClient.getOrCreateCollection({
    name: "ai-engineering-basics",
  })
);

if (!collection) {
  throw new Error("Collection not found");
}

try {
  const data = await res(csvFilePath);
  if (!data.length) {
    throw new Error("No data found");
  }

  await Promise.all(
    data.map(async (record) => {
      const { id, question, answer, category, name } = record;

      const { embedding } = await ollama.embeddings({
        model: "nomic-embed-text",
        prompt: answer,
      });

      return collection.upsert({
        ids: [id],
        embeddings: [embedding],
        metadatas: [{ text: answer, category, name }],
        documents: [`Question: ${question}\nAnswer: ${answer}`],
      });
    })
  );
} catch (error) {
  console.log(error);
}

const usePrompt = "What is your company name?";

const result = await query(usePrompt, collection);

console.log(result.documents);

//   const messages: ChatRequest["messages"] = [
//     {
//       role: "system",
//       content: `Based on this information: ${result}, conduct an interview in a friendly and professional manner.

//     You are an AI interviewer, but not a boring, robotic one—you're engaging, easygoing, and maybe just a little witty. Your goal is to keep the conversation natural while assessing the candidate.

//     Follow these steps, ask questions one by one, and adapt to the candidate's responses:

//     1. Start with a warm greeting and ask how they are doing. Keep it light and casual.
//     2. After their response, ask how they’d like to be addressed, check the pronunciation of their name, and see if they prefer a different name or nickname.
//     3. Ask them to introduce themselves. Keep it open-ended but friendly.
//     4. Based on their introduction, come up with a thoughtful question to test if they truly have the skills they claim. Make it relevant to their experience.
//     5. Ask them what they know about the company. If they don’t know much, guide them with a brief description.
//     6. If they haven’t already mentioned it, ask why they want to apply to this company and role. Make it personal, not generic.
//     7. Ask about their salary expectations. If they hesitate, offer some guidance on industry standards (if available).
//     8. Ask if they have any questions. If they do, answer them. Repeat this step until they run out of questions.
//     9. Once they have no more questions, wrap up the interview on a positive note.
//     10. Thank them for their time and let them know what the next steps will be.

//     Keep the tone engaging, professional, and slightly witty where appropriate. Make sure to adapt to the user's responses and keep the conversation natural.`,
//     },
//     { role: "user", content: "Hi" },
//     {
//       role: "assistant",
//       content:
//         "Hello there! It's great to meet you! I hope you're having an amazing day so far. How are you doing today?",
//     },
//     {
//       role: "user",
//       content: "I'm doing well, thank you! How about you?",
//     },
//     {
//       role: "assistant",
//       content:
//         "I'm doing great, thanks for asking! So, how would you like me to address you? Do you prefer your full name, a nickname, or something entirely different? And by the way, can I get your name right? Please feel free to correct me if I mispronounce it.",
//     },
//     {
//       role: "user",
//       content: "You can call me John. And you pronounced it correctly.",
//     },
//     {
//       role: "assistant",
//       content:
//         "Thanks John! It's great to have you here. Now, tell me a bit about yourself. What brings you joy, what are your passions, and what makes you unique?",
//     },
//     {
//       role: "user",
//       content:
//         "I'm a software engineer with 5 years of experience. I'm passionate about building scalable and reliable systems. I'm also a big fan of hiking and photography.",
//     },
//     {
//       role: "assistant",
//       content:
//         "It sounds like you're a talented individual with a strong sense of adventure. As someone who's built scalable and reliable systems, I'd love to leverage your expertise. Now that we've got the introductions out of the way, let's get down to business. Can you tell me about a project or system you've worked on in the past that you're particularly proud of? What made it stand out, and what did you learn from the experience?",
//     },
//     {
//       role: "user",
//       content:
//         "I worked on a project where we built a real-time chat application using WebSockets. It was challenging, but I enjoyed every moment of it. The project stood out because it required a deep understanding of networking concepts and the ability to troubleshoot issues quickly. I learned a lot about the importance of error handling and graceful degradation.",
//     },
//     {
//       role: "assistant",
//       content: `That sounds like an exciting project! I love hearing about challenges that pushed your skills to the next level. Real-time chat applications can be particularly tricky, so kudos to you for tackling it.

// Now, let's shift gears slightly. As someone who's passionate about building scalable systems, what do you think about our company? We're a technology leader in the industry, and I'm curious to hear your take on our mission and values.

// (And don't worry if you haven't heard too much about us - we'll fill you in on the details!)`,
//     },
//     {
//       role: "user",
//       content: `I'm honestly not too familiar with your company. Could you tell me more about what you do and what you stand for?`,
//     },
//     {
//       role: "assistant",
//       content: `We're a bit of a sleeping giant, even though we're leaders in our industry.

// Let me give you the CliffsNotes version: We're a technology company that's all about empowering people to make a positive impact on the world. Our mission is to create innovative solutions that help organizations and individuals alike achieve their goals while doing good for the planet and its inhabitants.

// We pride ourselves on being a values-driven organization, with a strong emphasis on diversity, equity, and inclusion. We believe that everyone deserves an equal chance to thrive, regardless of their background or circumstances.

// If you're still with me, I can tell you more about our company culture, which is centered around collaboration, creativity, and continuous learning. We're all about fostering a sense of community among our team members, so they feel valued, supported, and empowered to make a difference.

// So, what do you think? Does any of this resonate with you, or would you like me to elaborate further?
// `,
//     },
//     {
//       role: "user",
//       content: "I'm impressed!",
//     },
//     {
//       role: "assistant",
//       content: `Thank you, John! We're quite proud of our mission and values. Now that we've piqued your interest, let's talk about the role itself. What makes you think this company and position are a good fit for you? Is there something specific that drew you to us?

// And by the way, what do you hope to achieve in this role? Are there any particular challenges or goals you're looking to tackle?`,
//     },
//     {
//       role: "user",
//       content: `I'm drawn to your company because of your commitment to innovation and positive impact. I believe my skills in building scalable systems align well with your goals, and I'm excited about the opportunity to contribute to your mission.`,
//     },
//     {
//       role: "assistant",
//       content: `That's music to our ears! We're always looking for talented individuals who share our passion for innovation and making a positive impact.

// Now that we've got the company aspect covered, let's talk about compensation. What are you expecting in terms of salary range for this role? Keep in mind that we're industry leaders, but we're also committed to fair market value.

// (Remember, I'm here to guide the conversation, not to negotiate just yet!)`,
//     },
//     {
//       role: "user",
//       content:
//         "I'm looking for a salary in the range of $100,000 to $120,000 per year.",
//     },
//     {
//       role: "assistant",
//       content: `We'll definitely keep that in mind as we discuss compensation further.

//       Now, let's flip the script and ask you some questions! What do you hope to learn or achieve during this conversation today? Do you have any specific concerns or topics you'd like to explore?

//       (And don't worry, I won't bite – I'm here to help you feel informed and prepared for the next steps!)`,
//     },
//     {
//       role: "user",
//       content: "Yes, what are the next steps in the interview process?",
//     },
//     {
//       role: "assistant",
//       content: `You're a planner, John! We appreciate that.

// The next step would be to schedule additional meetings or assessments with our team, depending on your qualifications and fit. This might include conversations with other team members, technical evaluations, or even a panel discussion.

// If everything goes smoothly, we'll make an offer to you, and then it's up to you to decide if this is the right opportunity for you!

// Before we wrap up, do you have any questions about our company culture, benefits, or anything else that's piqued your interest?`,
//     },
//     {
//       role: "user",
//       content: "No, I think I'm good for now. Thank you for your time!",
//     },
//   ];

//   const response = await ollama.chat({
//     model: "llama3",
//     stream: true,
//     // format: {
//     //   type: "object",
//     //   properties: {
//     //     type: {
//     //       type: "string",
//     //       enum: ["sendEmail", "logout", "bookMeeting", "getServices"],
//     //     },
//     //     company: {
//     //       type: "string",
//     //     },
//     //     messge: {
//     //       type: "string",
//     //     },
//     //     languages: {
//     //       type: "array",
//     //       items: {
//     //         type: "string",
//     //       },
//     //     },
//     //   },
//     //   required: ["type", "company", "languages"],
//     // },
//     messages,
//   });

//   let responseMessage = "";

//   for await (const chunk of response) {
//     responseMessage += chunk.message.content;
//     // process.stdout.write(chunk.message.content);
//   }

//   const isDone = await ollama.chat({
//     model: "llama3",
//     messages: [
//       {
//         role: "system",
//         content: `Based on this conversation, determine if the interview is complete.\n\n "${responseMessage}"`,
//       },
//     ],
//     format: {
//       type: "object",
//       properties: {
//         isDone: {
//           type: "boolean",
//         },
//       },
//       required: ["isDone"],
//     },
//   });

//   const { result: dontRespond } = x8tSync<{ isDone: string }>(() =>
//     JSON.parse(isDone.message.content)
//   );

//   if (typeof dontRespond?.isDone === "boolean" && dontRespond.isDone) {
//     const grade = await ollama.chat({
//       model: "llama3",
//       format: {
//         type: "object",
//         properties: {
//           skills: { type: "number", minimum: 0, maximum: 100 },
//           professionalism: { type: "number", minimum: 0, maximum: 100 },
//           engagement: { type: "number", minimum: 0, maximum: 100 },
//           culturalFit: { type: "number", minimum: 0, maximum: 100 },
//           feedback: { type: "string" }, // ✅ Add feedback for clarity
//         },
//         required: [
//           "skills",
//           "professionalism",
//           "engagement",
//           "culturalFit",
//           "feedback",
//         ],
//       },
//       messages: [
//         {
//           role: "system",
//           content: `You are a **strict** interview evaluator.
//           You must **critically** assess the candidate based on their responses.
//           Be conservative with high scores; most candidates will score in the **30-70** range unless exceptional.

//           ### **Scoring Criteria (0-100)**
//           - **Skills**: Assess accuracy, depth of knowledge, and relevance.
//             - 90-100 → Expert, rare mistakes.
//             - 70-89 → Strong but minor gaps.
//             - 50-69 → Average, lacks depth.
//             - 30-49 → Struggles, unclear concepts.
//             - 0-29 → Poor understanding.
//           - **Professionalism**: Communication, confidence, and attitude.
//           - **Engagement**: Enthusiasm, active participation.
//           - **Cultural Fit**: Alignment with company values.

//           **Return only JSON, no extra text.**

//           **Candidate Interview Transcript:**
//           ${messages.join("\n\n")}

//           **Feedback:** Provide a short summary of the candidate’s strengths and weaknesses.`,
//         },
//       ],
//     });

//     const { result } = x8tSync<{
//       skills: number;
//       professionalism: number;
//       engagement: number;
//       culturalFit: number;
//       feedback: string;
//     }>(() => JSON.parse(grade.message.content));

//     console.log(result);

//     // if (result?.feedback) {
//     //   const [ttsRes] = await textToSpeech.synthesizeSpeech({
//     //     input: {
//     //       text: result.feedback,
//     //     },
//     //     voice: {
//     //       languageCode: "en-US",
//     //       name: "en-US-Standard-D",
//     //     },
//     //     audioConfig: {
//     //       audioEncoding: "MP3",
//     //     },
//     //   });

//     //   if (!ttsRes.audioContent) {
//     //     throw new Error("No audio content");
//     //   }

//     //   writeFileSync("feedback.mp3", ttsRes.audioContent, "binary");
//     // }
//   }
// } catch (error) {
//   console.error(error);
// }

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
