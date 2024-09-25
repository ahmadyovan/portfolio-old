'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './component/navigation';
import Background from './component/background';

const PageTransitionEffect = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = useMemo(() => ['/', '/about', '/project'], []);

  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (isScrollingRef.current) {
      // Jika sudah sedang scrolling, cegah scroll lebih lanjut
      return;
    }

    console.log('scrolling');
    isScrollingRef.current = true;

    const currentIndex = routes.indexOf(pathname);
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = (currentIndex + direction + routes.length) % routes.length;

    if (newIndex !== currentIndex) {
      console.log('navigate to next route');
      router.push(routes[newIndex]);

      // Set delay to reset scrolling state
      scrollTimeoutRef.current = setTimeout(() => {
        console.log('end of delay scrolling');
        isScrollingRef.current = false;
      }, 2500); // Delay for 1.5 seconds before allowing scrolling again
    }
  }, [pathname, router, routes]);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current); // Bersihkan timeout saat unmount
      }
    };
  }, [handleScroll]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="h-full w-full flex px-10">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} className="h-full w-full z-10">
            <motion.div
              className="h-full w-full z-10 pl-[5%]"
              initial={'hidden'}
              animate="enter"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                enter: { opacity: 1 },
                exit: { opacity: 0 },
              }}
              transition={{ ease: 'easeInOut', duration: 0.5 }}
            >
              {children}
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