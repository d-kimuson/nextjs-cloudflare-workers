import { defineConfig } from "orval";

export default defineConfig({
  dmm: {
    input: {
      target: "./schema/out/@typespec/openapi3/openapi.yaml",
    },
    output: {
      mode: "single",
      client: "fetch",
      httpClient: "fetch",
      baseUrl: "https://api.dmm.com/affiliate/v3",
      target: "src/server/lib/dmmApi/dmmApi.generated.ts",
    },
  },
});
