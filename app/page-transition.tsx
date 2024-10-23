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

const SCROLL_DELAY = 2000;
const NAVIGATION_COOLDOWN = 1000;
const ANIMATION_DURATION = 500; // Animation duration in milliseconds

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const lastNavigationTime = useRef(Date.now());
  const touchStartY = useRef<number | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousPathname = useRef(pathname);
  const exitComplete = useRef(false);

  // Reset navigation state when pathname changes
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      setIsNavigating(false);
      setIsExiting(false);
      exitComplete.current = false;
      lastNavigationTime.current = Date.now();
      previousPathname.current = pathname;
    }
  }, [pathname]);

  const handleNavigation = useCallback(async (direction: number) => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTime.current;
    
    if (isNavigating || isExiting || timeSinceLastNavigation < NAVIGATION_COOLDOWN) {
      return;
    }

    const currentIndex = routes.indexOf(pathname);
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      setIsNavigating(true);
      setIsExiting(true);
      lastNavigationTime.current = now;

      // Wait for exit animation
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION));
      
      if (!exitComplete.current) {
        router.push(routes[newIndex]);
      }

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsNavigating(false);
        setIsExiting(false);
        exitComplete.current = false;
        scrollTimeout.current = null;
        lastNavigationTime.current = Date.now();
      }, SCROLL_DELAY);
    }
  }, [isNavigating, isExiting, pathname, router, routes]);

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (isNavigating || isExiting || scrollTimeout.current || 
        (Date.now() - lastNavigationTime.current) < NAVIGATION_COOLDOWN) {
      return;
    }

    const direction = e.deltaY > 0 ? 1 : -1;
    handleNavigation(direction);
  }, [handleNavigation, isNavigating, isExiting]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isNavigating && !isExiting && !scrollTimeout.current) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [isNavigating, isExiting]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY.current === null || isNavigating || isExiting || scrollTimeout.current) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffY) > 50) {
      const direction = diffY > 0 ? 1 : -1;
      handleNavigation(direction);
    }

    touchStartY.current = null;
  }, [handleNavigation, isNavigating, isExiting]);

  const cleanup = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
    setIsNavigating(false);
    setIsExiting(false);
    exitComplete.current = false;
    touchStartY.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    cleanup();

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      cleanup();
    };
  }, [handleScroll, handleTouchStart, handleTouchEnd, cleanup]);

  useEffect(() => {
    const handleBlur = () => {
      cleanup();
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [cleanup]);

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10">
        <AnimatePresence mode='wait' onExitComplete={() => {
          exitComplete.current = true;
          setIsExiting(false);
        }}>
          <motion.div 
            key={pathname} 
            className='h-full w-full z-10'
            initial="hidden"
            animate="enter"
            exit="exit"
            variants={{
              hidden: { 
                opacity: 0,
                y: 20 
              },
              enter: { 
                opacity: 1,
                y: 0,
                transition: {
                  duration: ANIMATION_DURATION / 1000,
                  ease: 'easeOut'
                }
              },
              exit: { 
                opacity: 0,
                y: -20,
                transition: {
                  duration: ANIMATION_DURATION / 1000,
                  ease: 'easeIn'
                }
              }
            }}
          >
            <motion.div className="h-full w-full z-10 pl-[5%]">
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