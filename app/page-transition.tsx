'use client'

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      func(...args);
      lastRun.current = now;
    } else {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        func(...args);
        lastRun.current = Date.now();
      }, delay);
    }
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

  // Flag to prevent multiple navigation in one scroll
  const [isNavigating, setIsNavigating] = useState(false);

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (!isNavigating) {
      const currentIndex = routes.indexOf(pathname);
      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = (currentIndex + direction + routes.length) % routes.length;

      if (newIndex !== currentIndex) {
        setIsNavigating(true); // Set flag to prevent further navigation
        router.push(routes[newIndex]);
        console.log('Navigating to next route:', routes[newIndex]);
      }
    }
  }, [pathname, router, routes, isNavigating]);

  const throttledHandleScroll = useThrottle(handleScroll, 1500);

  useEffect(() => {
    window.addEventListener('wheel', throttledHandleScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', throttledHandleScroll);
    };
  }, [throttledHandleScroll]);

  // Reset the `isNavigating` flag after 2 seconds to allow the next scroll navigation
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false); // Allow navigation again
      }, 1500); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup the timer on unmount
    }
  }, [isNavigating]);

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
