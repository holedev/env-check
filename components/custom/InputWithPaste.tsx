"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ClipboardIcon } from "lucide-react";
import * as React from "react";

interface InputWithPasteProps extends React.ComponentProps<typeof Input> {
  onPasteClick?: (value: string) => void;
  inputClassName?: string;
  buttonClassName?: string;
}

const InputWithPaste = React.forwardRef<HTMLInputElement, InputWithPasteProps>(
  ({ className, onPasteClick, inputClassName, buttonClassName, ...props }, ref) => {
    const handlePaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (onPasteClick) {
          onPasteClick(text);
        }

        if (ref && typeof ref === "object" && ref.current) {
          const input = ref.current;
          // Update input value
          input.value = text;

          // Create and dispatch input event for react-hook-form
          const inputEvent = new Event("input", { bubbles: true });
          input.dispatchEvent(inputEvent);
        }
      } catch (err) {
        console.error("Failed to read clipboard:", err);
      }
    };

    return (
      <div className={cn("relative flex w-full", className)}>
        <Input
          ref={ref}
          className={cn("rounded-r-none focus-visible:z-10 focus-visible:ring-offset-0", inputClassName)}
          {...props}
        />
        <Button
          type='button'
          variant='outline'
          className={cn("rounded-l-none border-l-0 px-3 hover:bg-muted", buttonClassName)}
          onClick={handlePaste}
          title='Paste from clipboard'
        >
          <ClipboardIcon className='h-4 w-4' />
        </Button>
      </div>
    );
  }
);

InputWithPaste.displayName = "InputWithPaste";

export { InputWithPaste };
