"use client"; // needed to use useState/useEffect

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Horizontal from "@/components/horizontalbar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUserEmail"); // check if logged in
    if (currentUser) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <html className={cn("font-sans", geist.variable)}>
      <body className="flex">
        {isLoggedIn && <Sidebar />}
        <div className="flex-1">
          {isLoggedIn && <Horizontal />}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}