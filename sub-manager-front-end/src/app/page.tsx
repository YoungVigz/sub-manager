"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [data, setData] = useState<string | null>(null)

  useEffect(() => {
    fetch(process.env.API_URL || "")
      .then(res => res.text())
      .then((data: string) => setData(data)) 
      .catch((err: Error) => console.log(err))
  }, [])

  return (
    <>
      Testing for api calls: 

      <div>
        {data === null ? "Loading" : data}
      </div>

      testowaniesdfsdfsasdad
    </>
  )
}
