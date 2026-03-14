import Sidebar from "@/components/Sidebar";
import Horizontal from "@/components/horizontalbar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={cn("font-sans", geist.variable)}>
      <body className="flex">
        <Sidebar />
        <div className="flex-1 ">
          <Horizontal />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
