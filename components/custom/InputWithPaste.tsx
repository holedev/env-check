"use client";

import { ClipboardIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputWithPasteProps extends React.ComponentProps<typeof Input> {
  onPasteClick?: (value: string) => void;
  inputClassName?: string;
  buttonClassName?: string;
  hidden?: boolean;
}

const InputWithPaste = React.forwardRef<HTMLInputElement, InputWithPasteProps>(
  ({ className, onPasteClick, inputClassName, buttonClassName, hidden = true, ...props }, ref) => {
    const [show, setShow] = React.useState(!hidden);
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
      <div className={cn("relative flex w-full items-center", className)}>
        <Input ref={ref} type={show ? "text" : "password"} className={cn("pr-20", inputClassName)} {...props} />
        <div className={cn("absolute right-1 flex", buttonClassName)}>
          {hidden && (
            <Button
              type='button'
              variant='ghost'
              className='h-fit w-fit p-1'
              onClick={() => setShow(!show)}
              title={show ? "Hide" : "Show"}
            >
              {show ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
            </Button>
          )}
          <Button
            type='button'
            variant='ghost'
            className='h-fit w-fit p-1'
            onClick={handlePaste}
            title='Paste from clipboard'
          >
            <ClipboardIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    );
  }
);

InputWithPaste.displayName = "InputWithPaste";

export { InputWithPaste };
