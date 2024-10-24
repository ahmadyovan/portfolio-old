'use client'

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from '@/app/component/navigation';
import Background from '@/app/component/background';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { AnimatePresence, motion } from 'framer-motion';
import { Noticia } from './font';

const SCROLL_DELAY = 1000;

// Definisikan variants untuk animasi


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

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const routes = useMemo(() => ['/', '/about', '/project'], []);
  
  const [isNavigating, setIsNavigating] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const lastNavigationTime = useRef(Date.now());

  const handleNavigation = useCallback((direction: number) => {
    const now = Date.now();
    if (isNavigating || now - lastNavigationTime.current < SCROLL_DELAY) {
      return;
    }

    const currentIndex = routes.indexOf(pathname);
    const newIndex = (currentIndex + direction + routes.length) % routes.length;
    
    if (newIndex !== currentIndex) {
      setIsNavigating(true);
      lastNavigationTime.current = now;
      router.push(routes[newIndex]);
      
      setTimeout(() => {
        setIsNavigating(false);
      }, SCROLL_DELAY);
    }
  }, [isNavigating, pathname, router, routes]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    handleNavigation(direction);
  }, [handleNavigation]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isNavigating) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [isNavigating]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY.current === null || isNavigating) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    
    if (Math.abs(diffY) > 50) {
      const direction = diffY > 0 ? 1 : -1;
      handleNavigation(direction);
    }
    
    touchStartY.current = null;
  }, [handleNavigation, isNavigating]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd]);

  const Variants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <div className="h-full w-full flex px-10 z-10 overflow-hidden">
          <AnimatePresence mode='wait'>
            <motion.div key={pathname} className='h-full w-full z-10'>
              <motion.div  className={`h-full w-full z-10 pl-[5%]` + Noticia.className}  initial="initial" animate="animate" exit="exit" variants={Variants} transition={{ ease: 'easeInOut' }}>
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
}