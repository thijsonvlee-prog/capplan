import { useCallback, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within a container element.
 * Returns a callback ref to attach to the modal/dialog container.
 * Focus is captured when the ref is attached and restored to the previously focused element when detached.
 */
export function useFocusTrap() {
  const previousFocusRef = useRef<Element | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const callbackRef = useCallback((container: HTMLElement | null) => {
    // Cleanup previous trap
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!container) {
      // Container was removed — restore focus
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
      return;
    }

    // Save currently focused element
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element inside the container
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const focusable = container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    cleanupRef.current = () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return callbackRef;
}
