const getEnv = (key: string) => process.env[key];

const config = {
  port: getEnv("PORT"),
  chromaApiUrl: getEnv("CHROMA_API_URL"),
};

export default config;
