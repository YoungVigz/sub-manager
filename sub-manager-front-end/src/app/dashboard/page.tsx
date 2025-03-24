"use client"

import { useEffect } from "react"

export default function Dashboard() {

    useEffect(() => {
        const token = getAuthTokenFromCookie();

        const fetchData = async () => {
            const res = await fetch('http://localhost:8080/api/subscription', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            console.log(data);
        };
        
        fetchData();
    }, [])

    function getAuthTokenFromCookie() {
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('JWT='));
        
        return cookie ? cookie.split('=')[1] : null;
    }

    return (
        <div>
            Dashboard
        </div>
    )
}


