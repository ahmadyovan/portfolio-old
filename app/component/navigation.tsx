'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
    const pathname = usePathname(); // Panggil usePathname sebagai fungsi

    const url = {
        landing: '/',
        about: '/about',
        project: '/project'
    };

    return (
        <div className="flex flex-col items-end gap-10 pt-32">
            <Link href={url.landing}>
                <div className={`h-[0.6vh] w-20 blur-[1px] ${pathname === url.landing ? 'bg-purple-700' : 'bg-neutral-300'}`}></div>
            </Link>
            <Link href={url.about}>
                <div className={`h-[0.6vh] w-20 blur-[1px] ${pathname === url.about ? 'bg-purple-700' : 'bg-neutral-300'}`}></div>
            </Link>
            <Link href={url.project}>
                <div className={`h-[0.6vh] w-20 blur-[1px] ${pathname === url.project ? 'bg-purple-700' : 'bg-neutral-300'}`}></div>
            </Link>
        </div>
    );
};

export default Navigation;
