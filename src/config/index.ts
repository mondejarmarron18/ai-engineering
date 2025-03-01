const getEnv = (key: string) => process.env[key];

const config = {
  port: getEnv("PORT"),
  chroma: {
    apiUrl: getEnv("CHROMA_API_URL"),
    database: getEnv("CHROMA_DATABASE"),
    tenant: getEnv("CHROMA_TENANT"),
  },
};

export default config;
