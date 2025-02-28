import { ChromaClient } from "chromadb";
import config from "../config";

const chromaClient = new ChromaClient({ path: config.chromaApiUrl });

export default chromaClient;
