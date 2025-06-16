import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { floorList } from "../src/lib/api/dmmApi";
import { getRequiredEnv } from "./utils/env";

const main = async () => {
  const result = await floorList({
    affiliate_id: getRequiredEnv("DMM_AFFILIATE_ID"),
    api_id: getRequiredEnv("DMM_API_ID"),
  });

  await writeFile(
    resolve(process.cwd(), "src", "lib", "api", "sites.json"),
    JSON.stringify(
      result.data.result.site.reduce(
        (sites: Partial<Record<string, Record<string, unknown>>>, site) => {
          sites[site.name] = {
            code: site.code,
            services: site.service.reduce(
              (services: Partial<Record<string, unknown>>, service) => {
                services[service.name] = {
                  code: service.code,
                  floors: service.floor.reduce(
                    (floors: Partial<Record<string, unknown>>, floor) => {
                      floors[floor.name] = floor;
                      return floors;
                    },
                    {},
                  ),
                };
                return services;
              },
              {},
            ),
          };
          return sites;
        },
        {},
      ),
      null,
      2,
    ),
  );
};

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
