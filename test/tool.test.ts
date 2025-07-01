import enMessages from "@/configs/messages/en.json";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import type { ToolPath, ToolWithProgressType } from "@/types/tool";

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

  describe("Tool Requirements Validation", () => {
    describe("Tool Library Version Validation", () => {
      it("should have matching versions with package.json dependencies", () => {
        const pkg = require("../package.json");
        const toolsWithLibInfo = _TOOL_LIST.filter((tool) => "libInfo" in tool);

        for (const tool of toolsWithLibInfo) {
          const libInfo = tool.libInfo;
          const pkgVersion = pkg.dependencies[libInfo.packageName];

          if (!pkgVersion) {
            throw new Error(`Package ${libInfo.packageName} not found in dependencies`);
          }

          // Remove ^ from version strings for comparison
          const cleanPkgVersion = pkgVersion.replace("^", "");
          const cleanToolVersion = libInfo.version;

          if (cleanPkgVersion !== cleanToolVersion) {
            throw new Error(
              `Version mismatch for ${libInfo.packageName}: tool.ts is ${cleanToolVersion}, package.json is ${cleanPkgVersion}`
            );
          }
        }
      });
    });

    describe("Tools with progress inProgress or completed", () => {
      const toolsWithProgress = _TOOL_LIST.filter((tool) => {
        const toolProgress = (tool as ToolWithProgressType).progress;
        return toolProgress === "inProgress" || toolProgress === "completed";
      });

      it("should have page.tsx files for tools with inProgress or completed status", () => {
        const fs = require("node:fs");
        const path = require("node:path");

        for (const tool of toolsWithProgress) {
          // Find the tool's group
          const group = _TOOL_GROUP_LIST.find((g) => g.tools.includes(tool.path));

          if (group) {
            const pagePath = path.join(process.cwd(), "app", "tools", group.path, tool.path, "page.tsx");
            if (!fs.existsSync(pagePath)) {
              throw new Error(`Tool Requirement Validation Failed for '${tool.path}': Missing page.tsx file.`);
            }
          }
        }
      });

      it("should have test files for completed tools", () => {
        const fs = require("node:fs");
        const path = require("node:path");
        const completedTools = toolsWithProgress.filter(
          (tool) => (tool as ToolWithProgressType).progress === "completed"
        );

        for (const tool of completedTools) {
          const group = _TOOL_GROUP_LIST.find((g) => g.tools.includes(tool.path));

          if (group) {
            const toolDir = path.join(process.cwd(), "app", "tools", group.path, tool.path, "__tests__");
            const possibleTestFiles = ["page.test.tsx", "actions.test.ts"];

            let hasTestFiles = false;

            for (const testFile of possibleTestFiles) {
              const testPath = path.join(toolDir, testFile);
              if (fs.existsSync(testPath)) {
                hasTestFiles = true;
                break;
              }
            }

            if (!hasTestFiles) {
              throw new Error(
                `Tool Requirement Validation Failed for '${tool.path}': Missing test files. Expected one of ${possibleTestFiles.join(
                  ", "
                )}`
              );
            }
          }
        }
      });
    });

    describe("Tool file structure validation", () => {
      it("should validate completed tools have required files", () => {
        const fs = require("node:fs");
        const path = require("node:path");
        const completedTools = _TOOL_LIST.filter((tool) => (tool as ToolWithProgressType).progress === "completed");

        for (const tool of completedTools) {
          const group = _TOOL_GROUP_LIST.find((g) => g.tools.includes(tool.path));

          if (group) {
            const toolDir = path.join(process.cwd(), "app", "tools", group.path, tool.path);
            const requiredFiles = ["page.tsx"];

            for (const file of requiredFiles) {
              const filePath = path.join(toolDir, file);
              if (!fs.existsSync(filePath)) {
                throw new Error(
                  `Tool Requirement Validation Failed for '${tool.path}': Missing required file '${file}'.`
                );
              }
            }
          }
        }
      });
    });

    describe("Test coverage for completed tools", () => {
      it("should have comprehensive test coverage", () => {
        const fs = require("node:fs");
        const path = require("node:path");
        const completedTools = _TOOL_LIST.filter((tool) => (tool as ToolWithProgressType).progress === "completed");

        expect(completedTools.length).toBeGreaterThan(0);

        for (const tool of completedTools) {
          const group = _TOOL_GROUP_LIST.find((g) => g.tools.includes(tool.path));

          if (group) {
            const toolDir = path.join(process.cwd(), "app", "tools", group.path, tool.path, "__tests__");

            const testFiles = [
              { file: "page.test.tsx", exists: fs.existsSync(path.join(toolDir, "page.test.tsx")) },
              { file: "actions.test.ts", exists: fs.existsSync(path.join(toolDir, "actions.test.ts")) }
            ];

            const testCoverage = testFiles.filter((t) => t.exists).length;
            if (testCoverage < 2) {
              const missingFiles = testFiles.filter((t) => !t.exists).map((t) => t.file);
              throw new Error(
                `Tool Requirement Validation Failed for '${
                  tool.path
                }': Insufficient test coverage. Missing: ${missingFiles.join(", ")}`
              );
            }
          }
        }
      });
    });
  });
});
