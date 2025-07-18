"use client"

import Footer from "@/components/footer/Footer"
import Header from "@/components/header/Header"
import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="flex flex-col justify-center items-center w-full min-h-full text-center">
        <h1 className="font-bold mb-2 text-lg md:text-2xl lg:text-4xl">Effortless Subscription Management</h1>
        <p className="mb-5 text-base md:text-lg lg:text-xl text-secondary">Save time and money by managing all your subscriptions in one place.</p>
        <div className="mb-12">
          <button className="button">
            <Link href="/auth">
              Get Started
            </Link>
          </button>
        </div>

        <img className="landing-img hidden md:block" src="./landing-placeholder.png" alt="Image showing dashboard of the app." />
      </main>

      <Footer />
    </>
  )
}
