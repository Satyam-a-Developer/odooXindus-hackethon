'use client'

import React from 'react'

export default function HorizontalBar() {
  return (
    <div className="w-full h-16 bg-white border-b flex items-center justify-between px-6">

      {/* Search Bar */}
      <div className="flex items-center w-[350px] bg-gray-100 rounded-lg px-3 py-2">
        <svg
          className="w-4 h-4 text-gray-500 mr-2"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx="11"
            cy="11"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">

        <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">
          + New Receipt
        </button>

        <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
          + New Delivery
        </button>

      </div>

    </div>
  )
}