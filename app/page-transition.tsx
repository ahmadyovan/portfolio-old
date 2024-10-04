'use client'

import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './component/navigation';
import Background from './component/background';

function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  return frozen ? (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  ) : (
    <>{children}</>
  );
}

function useThrottle<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      func(...args);
      lastRun.current = now;
    }
  }, [func, delay]);
}

function useDebounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);
}


const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);

  const isScrolling = useRef(false); // Track if a scroll event is in progress
  const touchStartY = useRef<number | null>(null); // Track touch start position

  // Handle scroll events (for desktop)
  const handleScroll = useCallback((e: WheelEvent) => {
    if (isScrolling.current) return; // Prevent multiple navigation triggers

    e.preventDefault();

    const currentIndex = routes.indexOf(pathname);
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      isScrolling.current = true; // Set flag to prevent further scrolling

      router.push(routes[newIndex]);
      console.log('Navigating to next route:', routes[newIndex]);

      setTimeout(() => {
        isScrolling.current = false; // Reset after delay (2 seconds)
      }, 2000); // 2 seconds delay
    }
  }, [pathname, router, routes]);

  // Handle swipe events (for mobile)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY; // Get Y position where the touch started
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY.current === null) return;

    const touchEndY = e.changedTouches[0].clientY; // Get Y position where the touch ended
    const diffY = touchStartY.current - touchEndY; // Calculate the difference

    const currentIndex = routes.indexOf(pathname);
    let newIndex = currentIndex;

    if (Math.abs(diffY) > 50) { // Only consider swipe if the movement is significant
      if (diffY > 0) {
        // Swipe up - go to next
        newIndex = (currentIndex + 1) % routes.length;
      } else {
        // Swipe down - go to previous
        newIndex = (currentIndex - 1 + routes.length) % routes.length;
      }

      if (newIndex !== currentIndex) {
        isScrolling.current = true; // Prevent further swipes until the navigation completes

        router.push(routes[newIndex]);
        console.log('Navigating to next route (Swipe):', routes[newIndex]);

        setTimeout(() => {
          isScrolling.current = false; // Reset after 2 seconds
        }, 1000);
      }
    }

    touchStartY.current = null; // Reset the touch start position
  }, [pathname, router, routes]);

  const throttledHandleScroll = useThrottle(handleScroll, 1000); // Throttle for scroll events
  const debouncedHandleScroll = useDebounce(throttledHandleScroll, 1000); // Debounce to smooth the scroll event

  useEffect(() => {
    // Add event listeners for desktop scrolling
    window.addEventListener('wheel', debouncedHandleScroll, { passive: false });

    // Add event listeners for mobile swipe gestures
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      // Remove event listeners
      window.removeEventListener('wheel', debouncedHandleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [debouncedHandleScroll, handleTouchStart, handleTouchEnd]);

  console.log('render');
  

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10">
        <AnimatePresence mode='wait'>
          <motion.div key={pathname} className='h-full w-full z-10'>
            <motion.div className="h-full w-full z-10 pl-[5%]" initial="hidden" animate="enter" exit="exit" variants={{
              hidden: { opacity: 0 },
              enter: { opacity: 1 },
              exit: { opacity: 0 },
            }} transition={{ ease: 'easeInOut', duration: 0.5 }}>
              <FrozenRouter>
      {children}
              </FrozenRouter>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="h-full w-1/5 flex items-center justify-end p-10 z-10">
          <Navigation />
        </div>
      </div>
      <Background />
    </div>
  );
});

PageTransitionEffect.displayName = 'PageTransitionEffect';

export default PageTransitionEffect;
