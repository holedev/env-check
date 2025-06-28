import enMessages from "@/configs/messages/en.json";
import viMessages from "@/configs/messages/vi.json";

type MessageObject = {
  [key: string]: string | MessageObject;
};

function getAllKeys(obj: MessageObject, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        keys = keys.concat(getAllKeys(obj[key] as MessageObject, path));
      } else {
        keys.push(path);
      }
    }
  }
  return keys;
}

describe("i18n", () => {
  it("should have all keys in en.json must in vi.json", () => {
    const enKeys = getAllKeys(enMessages);
    const viKeys = getAllKeys(viMessages);

    for (const key of enKeys) {
      if (!viKeys.includes(key)) {
        throw new Error(`Missing i18n key in vi.json: ${key}`);
      }
    }
  });
});
