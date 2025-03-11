"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <div>
      <div>
        Welcome to sub-manager
      </div>

      <div>
        <button>
          <Link href="/auth">
            Get Started
          </Link>
        </button>
      </div>
    </div>
  )
}
