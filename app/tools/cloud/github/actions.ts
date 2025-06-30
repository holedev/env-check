"use server";

import { handleErrorServerNoAuth } from "@/utils/handleErrorServer";
import { Octokit } from "@octokit/rest";

type GithubToken = {
  token: string;
};

const checkGithubToken = async (config: GithubToken) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const octokit = new Octokit({ auth: config.token });
      const { data } = await octokit.rest.users.getAuthenticated();
      return data;
    }
  });

export { checkGithubToken };
