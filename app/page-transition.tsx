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
): T {
  const lastRun = useRef(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      func(...args);
      lastRun.current = now;
    }
  }, [func, delay]) as T;
}

function useDebounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): T {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]) as T;
}

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);

  const variants = {
    hidden: { opacity: 0 },
    enter: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const isScrolling = useRef(false); // Track if a scroll event is in progress

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
      }, 1000); // 2 seconds delay
    }
  }, [pathname, router, routes]);

  const throttledHandleScroll = useThrottle(handleScroll, 1000); // Add throttle
  const debouncedHandleScroll = useDebounce(throttledHandleScroll, 1000); // Add debounce to prevent rapid scroll events

  useEffect(() => {
    window.addEventListener('wheel', debouncedHandleScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', debouncedHandleScroll);
    };
  }, [debouncedHandleScroll]);

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10">
        <AnimatePresence mode='wait'>
          <motion.div key={pathname} className='h-full w-full z-10'>
            <motion.div className="h-full w-full z-10 pl-[5%]" initial="hidden" animate="enter" exit="exit" variants={variants} transition={{ ease: 'easeInOut', duration: 0.5 }}>
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
