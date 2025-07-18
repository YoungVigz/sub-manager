"use client"

import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { useEffect, useState } from "react"

enum AuthType {
  LOGIN,
  REGISTER
}

interface InputErrors {
  username: string;
  password: string;
  email: string;
}

const usernameRegex: RegExp = /^[a-zA-Z0-9]{4,}$/;
const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,16}$/;

export default function Auth() {
    const [authType, setAuthType] = useState<AuthType>(getAuthType())
    const [error, setError] = useState<InputErrors>({
      username: "",
      password: "",
      email: "",
    })

    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: ""
    })

    function getAuthType(): AuthType {
      if(localStorage.getItem("haveLoggedIn")) {
        return AuthType.LOGIN;
      }

      return AuthType.REGISTER;
    }

    function changeAuthType() {
      if(authType === AuthType.REGISTER) 
        setAuthType(AuthType.LOGIN)
      else
        setAuthType(AuthType.REGISTER)
    }

    const validateField = (name: string, value: string): string => {
      switch (name) {
        case "username":
          return usernameRegex.test(value) ? "" 
            : "Username must be at least 4 alphanumeric characters";
        case "password":
          return passwordRegex.test(value) ? "" 
            : "Password must be 6-16 chars with uppercase, lowercase, number and special";
        case "email":
          return authType === AuthType.REGISTER && !emailRegex.test(value) 
            ? "Invalid email format" 
            : "";
        default:
          return "";
      }
    }

    const checkForErrors = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      const errorMessage = validateField(name, value)
      
      setError(prev => ({
        ...prev,
        [name]: errorMessage
      }))
    }

    function clearError(e: React.FocusEvent<HTMLInputElement>) {
      const { name } = e.target;
      setError((prev) => ({ ...prev, [name]: "" }));
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

        if(data.authenticationToken){
          document.cookie = `JWT=${data.authenticationToken}; path=/; Secure`;

          localStorage.setItem("haveLoggedIn", "true");

          window.location.reload();
        }

      } catch (error) {
        console.log(error)
      }
    }

    return (
      <>
        <Header/>
        <main className="flex flex-col justify-center items-center w-full min-h-full text-center"> 

          <form onSubmit={handleSubmit} className="flex flex-col h-80">

            { authType === AuthType.REGISTER ? (
              <>
                <h1 className="mb-5 font-bold text-2xl text-center">Create account</h1>

                <input
                  className={`mb-5 px-5 py-2 rounded-lg text-opposite border-2 ${
                    error.username ? "border-red-500" : ""
                  }`}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                
                <input
                  className={`mb-5 px-5 py-2 rounded-lg text-opposite border-2 ${
                    error.email ? "border-red-500" : ""
                  }`}
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />

                <input
                  className={`mb-5 px-5 py-2 rounded-lg text-opposite border-2 ${
                    error.password ? "border-red-500" : ""
                  }`}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />

                <button type="submit" className="button">Sign up</button>
              </>
            ) : (
              <>
                <h1 className="mb-5 font-bold text-2xl text-center">Login</h1>
              
                <input
                  className={`mb-5 px-5 py-2 rounded-lg text-opposite border-2 ${
                    error.username ? "border-red-500" : ""
                  }`}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />

                <input
                  className={`mb-5 px-5 py-2 rounded-lg text-opposite border-2 ${
                    error.password ? "border-red-500" : ""
                  }`}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={clearError}
                />
                <button type="submit" className="button">Sign in</button>
              </>
            ) }

          </form>
    
          <div className="mt-5 cursor-pointer underline" onClick={changeAuthType}>
            { authType === AuthType.REGISTER ? (<p>Already have an account? Log in</p>) : (<p>Do not have an account? Sign up</p>)}
          </div>
        </main>
        <Footer/>
      </>
    )
  }
  