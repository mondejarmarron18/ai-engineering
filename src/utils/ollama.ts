import { Ollama } from "ollama";
import config from "../config";

const ollama = new Ollama({
  host: config.ollama.apiUrl,
});

export default ollama;
