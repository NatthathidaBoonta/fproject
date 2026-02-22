import React from 'react'
import { Link } from 'react-router'

export default function Header({ variant = 'dashboard', title }) {
  if (variant === 'profile') {
    return (
      <div className="bg-white rounded-t-lg shadow-sm px-3 py-3 flex items-center">
        <Link to="/Home" className="text-gray-700 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 text-center text-cyan-500 font-medium text-lg">{title || 'Profile'}</div>
        <div className="w-6" />
      </div>
    )
  }

  // default: dashboard header (name + avatar)
  return (
    <div className="max-w-full mx-auto px-0 py-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-cyan-600 font-semibold text-xl">ณัฏฐธิดา บุญทา</div>
        </div>

        <Link to="/Profile" aria-label="Profile">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:shadow">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
          </div>
        </Link>
      </div>
    </div>
  )
}
