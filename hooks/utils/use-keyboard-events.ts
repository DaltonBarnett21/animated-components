import { useKeyboard } from "@react-aria/interactions";

const KEYBOARD_EVENT_KEYS = {
  ArrowDown: "ArrowDown",
  ArrowRight: "ArrowRight",
  ArrowLeft: "ArrowLeft",
  Escape: "Escape",
  Enter: "Enter",
  Backspace: "Backspace",
};
export type KeyboardArrowHorizontalDirection = "left" | "right";
type Props = {
  events: {
    keydown: {
      onArrowDown: () => void;
      onEscape?: () => void;
      onEnter?: () => void;
      onBackspace?: (text: string) => void;
      onArrowMove?: (
        text: string,
        direction: KeyboardArrowHorizontalDirection
      ) => void;
    };
  };
};
const useKeyboarEvents = ({ events: { keydown } }: Props) => {
  const { keyboardProps } = useKeyboard({
    onKeyDown: (event) => {
      const target = event.target as HTMLInputElement;
      const text = target.value;
      switch (event.key) {
        case KEYBOARD_EVENT_KEYS.ArrowDown:
          // This prevent default solved my problem.
          event.preventDefault();
          keydown.onArrowDown();
          break;
        // case KEYBOARD_EVENT_KEYS.ArrowLeft:
        //   keydown.onArrowMove(text, "left");
        //   break;
        // case KEYBOARD_EVENT_KEYS.ArrowRight:
        //   keydown.onArrowMove(text, "right");
        //   break;
        // case KEYBOARD_EVENT_KEYS.Escape:
        //   keydown.onEscape();
        //   break;
        // case KEYBOARD_EVENT_KEYS.Enter:
        //   keydown.onEnter();
        //   break;
        // case KEYBOARD_EVENT_KEYS.Backspace:
        //   keydown.onBackspace(text);
        //   break;
      }
    },
  });

  return {
    keyboardProps,
  };
};

export default useKeyboarEvents;
