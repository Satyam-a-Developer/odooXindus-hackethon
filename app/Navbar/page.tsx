import React from 'react'
import Sidebar from "@/components/Sidebar";
import Horizontal from "@/components/horizontalbar";

export default function Navbar() {
  return (
    <div>
          <body className="flex">
                <Sidebar />
                <div className="flex-1 ">
                  <Horizontal />
                  </div>
            </body>
      
    </div>
  )
}
