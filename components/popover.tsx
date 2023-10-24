"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ANIMATIONS, cn } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";

const popoverOpenContext = React.createContext<boolean>(false);

function Popover({ children, ...props }: PopoverPrimitive.PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <popoverOpenContext.Provider value={isOpen}>
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen} {...props}>
        {children}
      </PopoverPrimitive.Root>
    </popoverOpenContext.Provider>
  );
}

const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent(
  { children, className, ...props }: PopoverPrimitive.PopoverContentProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  const isOpen = React.useContext(popoverOpenContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Content
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
            {children}
          </motion.div>
        </PopoverPrimitive.Content>
      )}
    </AnimatePresence>
  );
}

const Tester = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="App">
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
      >
        <PopoverPrimitive.Trigger className="trigger">
          Trigger
        </PopoverPrimitive.Trigger>
        <AnimatePresence>
          {isOpen && (
            <PopoverPrimitive.Content forceMount asChild>
              <motion.div
                initial={ANIMATIONS.scaleSpringOpacity.exit}
                animate={ANIMATIONS.scaleSpringOpacity.enter}
                exit={ANIMATIONS.scaleSpringOpacity.exit}
              >
                <h3>Popover content</h3>
                <p>Are you sure you wanna do this?</p>
                <PopoverPrimitive.Close>X</PopoverPrimitive.Close>
                <PopoverPrimitive.Arrow className="arrow" />
              </motion.div>
            </PopoverPrimitive.Content>
          )}
        </AnimatePresence>
      </PopoverPrimitive.Root>
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent, Tester };
