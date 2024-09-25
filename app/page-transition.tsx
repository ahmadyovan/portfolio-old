'use client';

import React, { useState, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
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

// Throttle function
const throttle = <Args extends unknown[]>(
	func: (...args: Args) => void,
	limit: number
  ): (...args: Args) => void => {
	let inThrottle = false;
	return (...args: Args) => {
	  if (!inThrottle) {
		func(...args);
		inThrottle = true;
		setTimeout(() => inThrottle = false, limit);
	  }
	};
};

const PageTransitionEffect: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
	const pathname = usePathname();
	const router = useRouter();
	const routes = useMemo(() => ['/', '/about', '/project'], []);
	const [currentIndex, setCurrentIndex] = useState(() => routes.indexOf(pathname));
	const [isNavigating, setIsNavigating] = useState(false);
  
	const variants = {
	  hidden: { opacity: 0 },
	  enter: { opacity: 1 },
	  exit: { opacity: 0 },
	};
  
	const handleScroll = useCallback((e: WheelEvent) => {
	  e.preventDefault();
	  if (isNavigating) return;
  
	  console.log('Scroll event processed');
  
	  const direction = e.deltaY > 0 ? 1 : -1;
	  const newIndex = (currentIndex + direction + routes.length) % routes.length;
  
	  if (newIndex !== currentIndex) {
		setIsNavigating(true);
		setCurrentIndex(newIndex);
		router.push(routes[newIndex]);
		console.log(`Navigating to: ${routes[newIndex]}`);
  
		// Add a delay after navigation
		setTimeout(() => {
		  setIsNavigating(false);
		}, 4000); // 1 second delay, adjust as needed
	  }
	}, [currentIndex, router, routes, isNavigating]);
  
	const throttledHandleScroll = useMemo(
	  () => throttle(handleScroll, 5000),
	  [handleScroll]
	);
  
	useEffect(() => {
	  console.log('Adding wheel event listener');
	  window.addEventListener('wheel', throttledHandleScroll, { passive: false });
  
	  return () => {
		console.log('Removing wheel event listener');
		window.removeEventListener('wheel', throttledHandleScroll);
	  };
	}, [throttledHandleScroll]);
  
	useEffect(() => {
	  console.log('Pathname changed. New pathname:', pathname);
	  setCurrentIndex(routes.indexOf(pathname));
	}, [pathname, routes]);
  
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
				variants={variants} 
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