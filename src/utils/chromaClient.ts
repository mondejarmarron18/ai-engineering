import { ChromaClient, AdminClient } from "chromadb";
import config from "../config";

const chromaClient = new ChromaClient({
  path: config.chroma.apiUrl,
  
});


// export const chromaCreateTenant = async (tenant?: string) => {
//   const tenantName = tenant || config.chroma.tenant;

//   try {
//     const adminClient = new AdminClient({
//       path: config.chroma.apiUrl,
//     });
//     const tenant = await adminClient.getTenant({
//       name: tenantName as string,
//     });

//     console.log(tenant);
//     // if (tenant) {
//     //   return console.log("Tenant already exists");
//     // }
//     // await adminClient.createTenant({
//     //   name: tenantName as string,
//     // });
//   } catch (error) {
//     console.log(error);
//   }
// };

export default chromaClient;
