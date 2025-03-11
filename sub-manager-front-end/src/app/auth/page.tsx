"use client"

import { useRouter } from "next/router"
import { useState } from "react"

enum AuthType {
  LOGIN,
  REGISTER
}

export default function Auth() {
    const [authType, setAuthType] = useState(AuthType.REGISTER)

    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: ""
    })

    function changeAuthType() {
      if(authType === AuthType.REGISTER) 
        setAuthType(AuthType.LOGIN)
      else
        setAuthType(AuthType.REGISTER)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()

      try {
        const endpoint = "http://localhost:8080/api" + "/auth/" + (authType === AuthType.REGISTER ? "register" : "login");

        const response = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          }
        })

        const data = await response.json();

        document.cookie = `JWT=${data.authenticationToken}; path=/; Secure`;

      } catch (error) {
        console.log(error)
      }
    
      window.location.reload();
    }

    return (
      <div className=""> 

        <form onSubmit={handleSubmit} className="flex flex-col h-80">

          { authType === AuthType.REGISTER ? (
            <>
              <h1 className="mb-5 font-bold text-2xl text-center">Create account</h1>
              <input className="mb-5 px-5 py-2 rounded-lg" type="text" name="username" placeholder="Username" onChange={handleChange}/>
              <input className="mb-5 px-5 py-2 rounded-lg" type="text" name="email" placeholder="E-mail" onChange={handleChange}/>
              <input className="mb-5 px-5 py-2 rounded-lg" type="password" name="password" placeholder="Password" onChange={handleChange}/>

              <button type="submit">Sign up</button>
            </>
          ) : (
            <>
              <h1 className="mb-5 font-bold text-2xl text-center">Login</h1>
              <input className="mb-5 px-5 py-2 rounded-lg" type="text" name="username" placeholder="Username" onChange={handleChange}/>
              <input className="mb-5 px-5 py-2 rounded-lg" type="password" name="password" placeholder="Password" onChange={handleChange}/>

              <button type="submit">Sign in</button>
            </>
          ) }

        </form>
  
        <div className="mt-5 cursor-pointer underline" onClick={changeAuthType}>
          { authType === AuthType.REGISTER ? (<p>Already have an account? Log in</p>) : (<p>Do not have an account? Sign up</p>)}
        </div>
      </div>
    )
  }
  