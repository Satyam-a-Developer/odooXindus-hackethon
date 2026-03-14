'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

type NavItem = {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
}

type Section = {
  title: string
  items: NavItem[]
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const SECTIONS: Section[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="13" y="3" width="8" height="5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="13" y="10" width="8" height="11" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      }
    ]
  },
  {
    title: 'PRODUCTS',
    items: [
      {
        name: 'All Products',
        href: '/products',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      {
        name: 'Receipts',
        href: '/receipts',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      },
      {
        name: 'Deliveries',
        href: '/deliveries',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      },
      {
        name: 'Transfers',
        href: '/transfers',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M4 12h16M12 4l4 4-4 4M12 20l-4-4 4-4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      },
      {
        name: 'Adjustments',
        href: '/adjustments',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 4l8 16H4z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      },
      {
        name: 'Move History',
        href: '/history',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      }
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      {
        name: 'Warehouse',
        href: '/warehouse',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 3l9 5v8l-9 5-9-5V8z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )
      }
    ]
  }
]

function NavItemLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
        active
          ? 'bg-blue-500/15 text-blue-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="w-4 h-4">{item.icon}</span>
        {item.name}
      </div>

      {item.badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export default function SidebarSheet() {
  const pathname = usePathname()

  return (
    <>
      {/* Sheet Trigger for Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            Menu
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[250px] bg-[#0f172a]/95 backdrop-blur text-slate-200 flex flex-col border-r border-slate-800 p-0">
          
          {/* Header / Logo */}
          <SheetHeader className="px-5 py-6 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold tracking-tight">
              Core<span className="text-blue-400">Inventory</span>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {SECTIONS.map(section => (
              <div key={section.title}>
                <p className="text-[11px] text-slate-500 font-semibold tracking-widest mb-2 px-3">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map(item => (
                    <NavItemLink
                      key={item.href}
                      item={item}
                      active={pathname === item.href}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Profile */}
          <div className="border-t border-slate-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
              IM
            </div>

            <div>
              <p className="text-sm font-medium">Inventory Manager</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>

        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[250px] min-h-screen bg-[#0f172a]/95 backdrop-blur text-slate-200 flex-col border-r border-slate-800">
        <div className="px-5 py-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">
            Core<span className="text-blue-400">Inventory</span>
          </h1>
        </div>
        <div className="flex-1 px-3 py-4 space-y-6">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[11px] text-slate-500 font-semibold tracking-widest mb-2 px-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(item => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
            IM
          </div>
          <div>
            <p className="text-sm font-medium">Inventory Manager</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </aside>
    </>
  )
}