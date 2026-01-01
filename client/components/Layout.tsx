import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  cartCount?: number;
}

export default function Layout({ children, cartCount = 0 }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-chicken-gray">
      <Header cartCount={cartCount} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
