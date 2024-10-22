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

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);
  
  // Use state to track navigation status
  const [isNavigating, setIsNavigating] = useState(false);
  const lastNavigationTime = useRef(0);
  const touchStartY = useRef<number | null>(null);

  const handleNavigation = useCallback((direction: number) => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTime.current;
    
    // Prevent navigation if we're already navigating or if it's too soon
    if (isNavigating || timeSinceLastNavigation < 1000) {
      return;
    }

    const currentIndex = routes.indexOf(pathname);
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      setIsNavigating(true);
      lastNavigationTime.current = now;

      router.push(routes[newIndex]);

      // Reset navigation state after animation completes
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
  }, [isNavigating, pathname, router, routes]);

  // Handle scroll events (for desktop)
  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    handleNavigation(direction);
  }, [handleNavigation]);

  // Handle touch events (for mobile)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY.current === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffY) > 50) {
      const direction = diffY > 0 ? 1 : -1;
      handleNavigation(direction);
    }

    touchStartY.current = null;
  }, [handleNavigation]);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleScroll, handleTouchStart, handleTouchEnd]);

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10">
        <AnimatePresence mode='wait'>
          <motion.div key={pathname} className='h-full w-full z-10'>
            <motion.div 
              className="h-full w-full z-10 pl-[5%]" 
              initial="hidden" 
              animate="enter" 
              exit="exit" 
              variants={{
                hidden: { opacity: 0 },
                enter: { opacity: 1 },
                exit: { opacity: 0 },
              }} 
              transition={{ ease: 'easeInOut', duration: 0.5 }}
            >
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