# CREATE NEW TOOL

## Overview

1. Add service configuration in `constants/tool.ts`.
2. Create service components in `app/tools/[category]/[service-path]/page.tsx`.
3. Add i18n strings in `configs/messages/`.
4. Update tests to cover new service functionality.

## Description

1. **Add Service Configuration**
  In `constants/tool.ts`, add the service configuration:

  ```typescript
  // Add to _TOOL_LIST
  {
    icon: "servicename", // Use icon name from simpleicons.org
    path: "service-path",
    progress: "notStarted" // Options: "notStarted", "inProgress", "completed"
  }

  // Add to _TOOL_GROUP_LIST under the appropriate category
  {
    path: "category",
    tools: [...existing, "service-path"]
  }
  ```

  **Important:** If progress is set to anything other than "notStarted" (e.g., "inProgress" or "completed"), you must create the corresponding page at `app/tools/[category]/[service-path]/page.tsx`.

2. **Create Service Components**
   Our project use Next.js and Server Actions, so you will create a new directory structure for the service under `app/tools/[category]/[service-path]/`.
   - `page.tsx`: Main page component
   - `actions.ts`: Server actions for key validation
   - `form.client.tsx` (optional): Form component for API key input

   Example structure:
   ```typescript
   // page.tsx
   const _TOOL_PATH: ToolPath = "service-path";
   const _LIB_INFO = {
     packageName: "package-name",
     url: "https://www.npmjs.com/package/package-name"
   };

   export default function Page() {
     return (
       <div>
         <ToolHeader toolPath={_TOOL_PATH} libInfo={_LIB_INFO} />
         <FormClient />
       </div>
     );
   }
   ```


3. **Add i18n Strings**
   Add translations in `configs/messages/`:
   ```json
   {
     "tools": {
       "items": {
         "service-path": {
           "name": "Service Name",
           "description": "Service Description",
           ... // Add other necessary strings
         }
       }
     }
   }
   ```
   Remember to add strings in both `en.json` and `vi.json`.

4. **Tests**
   Ensure all tests pass with `pnpm test`. 
   If status is "isProgress", you must create a file at `tests/tools/[category]/[service-path]/page.tsx`.
   If status is "completed", you must create test file at `tests/tools/[category]/[service-path]/page.test.tsx` and `tests/tools/[category]/[service-path]/actions.test.tsx`.