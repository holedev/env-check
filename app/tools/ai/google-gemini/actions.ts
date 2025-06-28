"use server";

import { handleErrorServerNoAuth } from "@/utils/handleErrorServer";
import OpenAI from "openai";

const _GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";

const checkAPIKey = async (apiKey: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: _GEMINI_BASE_URL
      });
      try {
        const models = await openai.models.list();
        const dataList = models.data;
        return dataList;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to Google Gemini API");
      }
    }
  });

export { checkAPIKey };
