import { useRef, useEffect, MutableRefObject, RefObject } from 'react';

/**
 * A hook that traps focus within a specified container when active.
 * Prevents focus from leaving the container, making it accessible for modals, dialogs, etc.
 * 
 * @param isActive Whether the focus trap is currently active
 * @param containerRef Ref to the container element where focus should be trapped
 * @param initialFocusRef Optional ref to the element that should receive focus when the trap activates
 * @param returnFocusRef Optional ref to the element that should receive focus when the trap deactivates
 * @param focusAfterDelay Optional delay in ms before focusing the initial element
 */
export function useFocusTrap(
  isActive: boolean,
  containerRef: RefObject<HTMLElement>,
  initialFocusRef?: RefObject<HTMLElement>,
  returnFocusRef?: RefObject<HTMLElement>,
  focusAfterDelay: number = 0
): void {
  // Store the element that had focus before the trap was activated
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Save the currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the initial element after a delay if provided, otherwise focus the container
    const focusInitialElement = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        // If no initial element is specified, focus the container itself
        // if it doesn't have tabindex, set it temporarily so it can receive focus
        const containerHadTabIndex = containerRef.current.hasAttribute('tabindex');
        if (!containerHadTabIndex) {
          containerRef.current.setAttribute('tabindex', '-1');
        }
        containerRef.current.focus();
        // Remove tabindex if we added it
        if (!containerHadTabIndex) {
          containerRef.current.removeAttribute('tabindex');
        }
      }
    };

    if (focusAfterDelay > 0) {
      setTimeout(focusInitialElement, focusAfterDelay);
    } else {
      focusInitialElement();
    }

    return () => {
      // Restore focus when the trap is deactivated
      if (isActive && returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (isActive && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocusRef, returnFocusRef, focusAfterDelay]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Get all tabbable elements within the container
    const getTabbableElements = (): HTMLElement[] => {
      if (!containerRef.current) return [];

      // Selector for all potentially focusable elements
      // This covers interactive elements that can receive focus via keyboard
      const selector = [
        'a[href]:not([tabindex="-1"])',
        'button:not([disabled]):not([tabindex="-1"])',
        'textarea:not([disabled]):not([tabindex="-1"])',
        'input:not([disabled]):not([tabindex="-1"])',
        'select:not([disabled]):not([tabindex="-1"])',
        'area[href]:not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])',
        '[contentEditable=true]:not([tabindex="-1"])'
      ].join(',');

      const tabbableElements = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(selector)
      ).filter(element => {
        // Additional check for visibility and disabled state
        return (
          window.getComputedStyle(element).display !== 'none' &&
          window.getComputedStyle(element).visibility !== 'hidden' &&
          !element.hasAttribute('disabled')
        );
      });

      return tabbableElements;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const tabbableElements = getTabbableElements();
      if (tabbableElements.length === 0) return;

      // Handle regular tab order
      const firstElement = tabbableElements[0];
      const lastElement = tabbableElements[tabbableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        // If shift+tab on first element, move to last element
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        // If tab on last element, move to first element
        event.preventDefault();
        firstElement.focus();
      }
    };

    // Handle clicks outside container - keep focus inside
    const handleFocusOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        event.preventDefault();
        // If focus moves outside container, pull it back in
        const tabbableElements = getTabbableElements();
        if (tabbableElements.length > 0) {
          tabbableElements[0].focus();
        } else if (containerRef.current) {
          containerRef.current.focus();
        }
      }
    };

    // Handle potential focus leaving the container
    const handleFocusIn = (event: FocusEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        event.preventDefault();
        // If focus somehow gets outside, bring it back
        const tabbableElements = getTabbableElements();
        if (tabbableElements.length > 0) {
          tabbableElements[0].focus();
        } else if (containerRef.current) {
          containerRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleFocusOutside);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleFocusOutside);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isActive, containerRef]);
}

/**
 * Hook to set initial focus on element when condition is true
 */
export function useInitialFocus(
  shouldFocus: boolean,
  elementRef: RefObject<HTMLElement>,
  delay: number = 0
): void {
  useEffect(() => {
    if (!shouldFocus || !elementRef.current) return;
    
    const timeoutId = setTimeout(() => {
      elementRef.current?.focus();
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [shouldFocus, elementRef, delay]);
}