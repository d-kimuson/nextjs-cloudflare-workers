import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { honoClient } from "../api/client";
import type { SessionBody } from "../../server/hono/middleware/session.middleware";

export const useSession = () => {
  const queryClient = useQueryClient();

  const sessionResult = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await honoClient.api.session.$get();
      const body = await response.json();
      return body.session ?? null;
    },
  });

  const agreeSession = useMutation({
    mutationFn: async () => {
      await honoClient.api.session.$post();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async (updated: SessionBody) => {
      await honoClient.api.session.$put({
        json: updated,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const clearSession = useMutation({
    mutationFn: async () => {
      await honoClient.api.session.$delete();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  return {
    session: sessionResult.isLoading
      ? ({
          status: "loading",
          data: undefined,
        } as const)
      : sessionResult.data === null || sessionResult.data === undefined
      ? ({
          status: "not-agreed",
          data: undefined,
        } as const)
      : ({
          status: "resolved",
          data: sessionResult.data as Exclude<
            typeof sessionResult.data,
            undefined
          >,
        } as const),
    agreeSession,
    updateSession,
    clearSession,
  };
};
