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

const SCROLL_DELAY = 2000; // Waktu delay setelah scroll dalam milliseconds
const NAVIGATION_COOLDOWN = 500; // Cooldown antara navigasi dalam milliseconds

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const lastNavigationTime = useRef(Date.now());
  const touchStartY = useRef<number | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleNavigation = useCallback((direction: number) => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTime.current;
    
    // Cek apakah cukup waktu telah berlalu sejak navigasi terakhir
    if (isNavigating || timeSinceLastNavigation < NAVIGATION_COOLDOWN) {
      return;
    }

    const currentIndex = routes.indexOf(pathname);
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      setIsNavigating(true);
      lastNavigationTime.current = now;

      // Jalankan navigasi
      router.push(routes[newIndex]);

      // Set timer untuk delay scroll
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsNavigating(false);
        scrollTimeout.current = null;
      }, SCROLL_DELAY);
    }
  }, [isNavigating, pathname, router, routes]);

  // Handle scroll events (desktop)
  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();

    // Cek apakah sedang dalam delay
    if (scrollTimeout.current) {
      return;
    }

    const direction = e.deltaY > 0 ? 1 : -1;
    handleNavigation(direction);
  }, [handleNavigation]);

  // Handle touch events (mobile)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isNavigating) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [isNavigating]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY.current === null || isNavigating) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffY) > 50) { // Minimal swipe distance
      const direction = diffY > 0 ? 1 : -1;
      handleNavigation(direction);
    }

    touchStartY.current = null;
  }, [handleNavigation, isNavigating]);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      
      // Clear any existing timeout on unmount
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
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