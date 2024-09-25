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
  const isThrottling = useRef(false); // Replaces `isNavigating`

  return useCallback((...args: Parameters<T>) => {
    if (!isThrottling.current) {
      func(...args); // Run the function if not throttled
      isThrottling.current = true; // Set throttle flag

      setTimeout(() => {
        isThrottling.current = false; // Reset the throttle after delay
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

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const currentIndex = routes.indexOf(pathname);
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      router.push(routes[newIndex]);
      console.log('Navigating to next route:', routes[newIndex]);
    }
  }, [pathname, router, routes]);

  const throttledHandleScroll = useThrottle(handleScroll, 2000);

  useEffect(() => {
    window.addEventListener('wheel', throttledHandleScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', throttledHandleScroll);
    };
  }, [throttledHandleScroll]);

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
