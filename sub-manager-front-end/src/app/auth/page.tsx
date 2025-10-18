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
  const [serverError, setServerError] = useState<string>("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  function getAuthType(): AuthType {
    if (typeof window !== "undefined" && localStorage.getItem("haveLoggedIn")) {
      return AuthType.LOGIN;
    }
    return AuthType.REGISTER;
  }

  function changeAuthType() {
    setAuthType(prev => prev === AuthType.REGISTER ? AuthType.LOGIN : AuthType.REGISTER)
    setServerError("") // wyczyść błędy przy zmianie trybu
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username":
        return usernameRegex.test(value)
          ? ""
          : "Username must be at least 4 alphanumeric characters";
      case "password":
        return passwordRegex.test(value)
          ? ""
          : "Password must be 6–16 chars with uppercase, lowercase, number, and special character";
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
    setServerError("") // czyść globalny błąd po focusie
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError("") // resetuj błędy z backendu

    try {
      const endpoint = "http://localhost:8080/api/auth/" + (authType === AuthType.REGISTER ? "register" : "login");

      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (authType === AuthType.LOGIN) {
          setServerError("Invalid login or password");
        } else {
          setServerError("Registration failed — please check your data");
        }
        return;
      }

      const data = await response.json();

      if (data.authenticationToken) {
        document.cookie = `JWT=${data.authenticationToken}; path=/; Secure`;
        localStorage.setItem("haveLoggedIn", "true");
        window.location.reload();
      }

    } catch (error) {
      setServerError("Server connection error — please try again later");
      console.error(error);
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center w-full min-h-full text-center">

        <form onSubmit={handleSubmit} className="flex flex-col h-auto w-80 mt-10">

          {authType === AuthType.REGISTER ? (
            <>
              <h1 className="mb-5 font-bold text-2xl text-center">Create account</h1>

              {/* USERNAME */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.username ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
              </div>

              {/* EMAIL */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.email ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
              </div>

              {/* PASSWORD */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.password ? "border-red-500" : "border-gray-300"}`}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
              </div>

              <button type="submit" className="button mt-2">Sign up</button>
            </>
          ) : (
            <>
              <h1 className="mb-5 font-bold text-2xl text-center">Login</h1>

              {/* USERNAME */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.username ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={checkForErrors}
                  onFocus={clearError}
                />
                {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
              </div>

              {/* PASSWORD */}
              <div className="mb-3 text-left">
                <input
                  className={`w-full px-5 py-2 rounded-lg text-opposite border-2 ${error.password ? "border-red-500" : "border-gray-300"}`}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={clearError}
                />
                {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
              </div>

              <button type="submit" className="button mt-2">Sign in</button>
            </>
          )}

          {/* GLOBAL ERROR */}
          {serverError && (
            <p className="text-red-500 text-sm mt-4 text-center">{serverError}</p>
          )}
        </form>

        <div className="mt-5 cursor-pointer underline" onClick={changeAuthType}>
          {authType === AuthType.REGISTER
            ? <p>Already have an account? Log in</p>
            : <p>Do not have an account? Sign up</p>}
        </div>
      </main>
      <Footer />
    </>
  )
}
