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

const ANIMATION_DURATION = 500;

// Custom hook untuk mengelola transisi
const usePageTransition = (routes: string[]) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(pathname);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigate = useCallback(async (direction: number) => {
    if (isAnimating) return;

    const currentIndex = routes.indexOf(currentPage);
    const newIndex = (currentIndex + direction + routes.length) % routes.length;
    const targetRoute = routes[newIndex];

    if (targetRoute !== currentPage) {
      setIsAnimating(true);
      setNextPage(targetRoute);
      
      // Tunggu animasi exit selesai sebelum navigasi
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION));
      
      router.push(targetRoute);
      setCurrentPage(targetRoute);
      
      // Reset state setelah navigasi
      setTimeout(() => {
        setIsAnimating(false);
        setNextPage(null);
      }, ANIMATION_DURATION);
    }
  }, [currentPage, routes, router, isAnimating]);

  return {
    currentPage,
    nextPage,
    isAnimating,
    navigate
  };
};

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const routes = useMemo(() => ['/', '/about', '/project'], []);
  const { currentPage, isAnimating, navigate } = usePageTransition(routes);
  
  const touchStartY = useRef<number | null>(null);
  const lastScrollTime = useRef(Date.now());
  const SCROLL_COOLDOWN = 1000;

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_COOLDOWN || isAnimating) {
      return;
    }

    lastScrollTime.current = now;
    const direction = e.deltaY > 0 ? 1 : -1;
    navigate(direction);
  }, [navigate, isAnimating]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isAnimating) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [isAnimating]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY.current === null || isAnimating) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffY) > 50) {
      const direction = diffY > 0 ? 1 : -1;
      navigate(direction);
    }

    touchStartY.current = null;
  }, [navigate, isAnimating]);

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

  // Variants untuk animasi
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_DURATION / 1000,
        ease: [0.43, 0.13, 0.23, 0.96] // Improved easing
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: ANIMATION_DURATION / 1000,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10 z-50">
        <div className="h-full w-full relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              className="h-full w-full absolute top-0 left-0"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onAnimationStart={() => {
                document.body.style.pointerEvents = 'none';
              }}
              onAnimationComplete={() => {
                document.body.style.pointerEvents = 'auto';
              }}
            >
              <div className="h-full w-full z-10 pl-[5%]">
                <FrozenRouter>
                  {children}
                </FrozenRouter>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
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