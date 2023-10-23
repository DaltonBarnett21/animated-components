"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ANIMATIONS, cn } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";

const popoverOpenContext = React.createContext<boolean>(false);

function Popover({ children, ...props }: PopoverPrimitive.PopoverProps) {
  const [isOpen, setOpen] = React.useState<boolean>(false);

  return (
    <popoverOpenContext.Provider value={isOpen}>
      <PopoverPrimitive.Root onOpenChange={setOpen} {...props}>
        {children}
      </PopoverPrimitive.Root>
    </popoverOpenContext.Provider>
  );
}

const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContentCore(
  { children, className, ...props }: PopoverPrimitive.PopoverContentProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  const isOpen = React.useContext(popoverOpenContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal forceMount>
          <PopoverPrimitive.PopoverContent
            ref={forwardedRef}
            forceMount
            asChild
            className={cn("", className)}
            {...props}
          >
            <motion.div
              initial={ANIMATIONS.scaleSpringOpacity.exit}
              animate={ANIMATIONS.scaleSpringOpacity.enter}
              exit={ANIMATIONS.scaleSpringOpacity.exit}
            >
              HELLO
            </motion.div>
          </PopoverPrimitive.PopoverContent>
        </PopoverPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

const PopoverContent = React.forwardRef(PopoverContentCore);

export { Popover, PopoverTrigger, PopoverContent };
