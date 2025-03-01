import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "http://192.168.1.12:11434",
});

export default ollama;
