"use client"

import { logout } from "@/utils/auth-functions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = ({}: HeaderProps) => {

  const [isLogin, setIsLogin] = useState(getAuthTokenFromCookie() ? true : false);

  function getAuthTokenFromCookie() {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('JWT='));
    
    return cookie ? cookie.split('=')[1] : null;
  }



  return (
    <header className="flex items-center justify-around border-b-slate-500">
        <h1 className="header-logo font-bold text-lg md:text-xl lg:text-2xl">
          <Link href="/">
            <img src="/Logo.svg" alt="Logo" />
          </Link>
        </h1>
        <div className="header-links flex justify-between items-center text-sm md:text-base">
            {isLogin === false 
            ? 
            <Link href="/auth">
              <div className="header-links--link header-links--link__featured p-3">Login</div>
            </Link>
            :
            <>
              <div onClick={logout} className="button-secondary">Logout!</div>
            </>  
            }
        </div>
    </header>
  );
};

export default Header;