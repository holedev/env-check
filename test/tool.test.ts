import enMessages from "@/configs/messages/en.json";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import type { ToolPath } from "@/types/tool";

describe("Tools", () => {
  describe("_TOOL_LIST", () => {
    it("should contain valid tool definitions", () => {
      for (const tool of _TOOL_LIST) {
        expect(tool).toHaveProperty("icon");
        expect(tool).toHaveProperty("path");

        expect(typeof tool.icon).toBe("string");
        expect(tool.icon.length).toBeGreaterThan(0);

        expect(typeof tool.path).toBe("string");
        expect(tool.path.length).toBeGreaterThan(0);
      }
    });

    it("should have unique path values for each tool", () => {
      const paths = _TOOL_LIST.map((tool) => tool.path);
      const uniquePaths = new Set(paths);

      expect(uniquePaths.size).toBe(_TOOL_LIST.length);
    });

    it("should have valid i18n keys in en.json", () => {
      for (const tool of _TOOL_LIST) {
        const item = enMessages.tools.items[tool.path as keyof typeof enMessages.tools.items];
        if (!item) {
          throw new Error(`Missing i18n default for tool: ${tool.path}`);
        }
        if (!item.name || !item.description) {
          throw new Error(`Missing i18n default name or description for tool: ${tool.path}`);
        }
      }
    });
  });

  describe("_TOOL_GROUP_LIST", () => {
    it("should contain valid group definitions", () => {
      for (const group of _TOOL_GROUP_LIST) {
        expect(group).toHaveProperty("path");
        expect(group).toHaveProperty("tools");

        expect(typeof group.path).toBe("string");
        expect(Array.isArray(group.tools)).toBeTruthy();
      }
    });

    it("should have unique path for each group", () => {
      const paths = _TOOL_GROUP_LIST.map((group) => group.path);
      const uniquePaths = new Set(paths);

      expect(uniquePaths.size).toBe(_TOOL_GROUP_LIST.length);
    });

    it("should have valid i18n keys in en.json", () => {
      for (const group of _TOOL_GROUP_LIST) {
        const item = enMessages.tools.groups[group.path as keyof typeof enMessages.tools.groups];
        if (!item) {
          throw new Error(`Missing i18n default for group: ${group.path}`);
        }
        if (!item.name || !item.description) {
          throw new Error(`Missing i18n default name or description for group: ${group.path}`);
        }
      }
    });
  });

  describe("Relationship _TOOL_LIST & _TOOL_GROUP_LIST", () => {
    it("should reference valid tool paths in groups", () => {
      const validToolPaths = new Set<ToolPath>(_TOOL_LIST.map((tool) => tool.path));

      for (const group of _TOOL_GROUP_LIST) {
        for (const toolPath of group.tools) {
          expect(validToolPaths.has(toolPath)).toBeTruthy();
        }
      }
    });

    it("should have each tool assigned to one group", () => {
      const toolGroupMap = new Map<string, string>();

      for (const group of _TOOL_GROUP_LIST) {
        for (const toolPath of group.tools) {
          if (toolGroupMap.has(toolPath)) {
            throw new Error(
              `Tool '${toolPath}' is assigned to multiple groups: ${toolGroupMap.get(toolPath)} and ${group.path}`
            );
          }
          toolGroupMap.set(toolPath, group.path);
        }
      }
    });

    it("should have all tools from _TOOL_LIST be assigned to group", () => {
      const allToolPaths = new Set(_TOOL_LIST.map((tool) => tool.path));

      const groupedToolPaths = new Set<string>();
      for (const group of _TOOL_GROUP_LIST) {
        for (const toolPath of group.tools) {
          groupedToolPaths.add(toolPath);
        }
      }

      const unassignedTools = [...allToolPaths].filter((path) => !groupedToolPaths.has(path));

      if (unassignedTools.length > 0) {
        throw new Error(`The following tools are not assigned to any group: ${unassignedTools.join(", ")}`);
      }
    });
  });
});
