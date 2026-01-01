import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Accueil", path: "/" },
    { label: "Menu Complet", path: "/menu" },
    { label: "Mon Panier", path: "/cart" },
    { label: "Mes Commandes", path: "/orders" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-primary h-16 border-b border-primary/20 shadow-md">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-lg md:text-xl font-black">🍗</span>
          </div>
          <div className="hidden xs:flex items-baseline gap-1">
            <span className="font-black text-lg md:text-xl text-secondary">CHICKEN</span>
            <span className="font-black text-lg md:text-xl text-white">MASTER</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-semibold transition-colors ${
                isActive(item.path)
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Cart and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-chicken-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="w-6 h-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-chicken-navy p-0"
            >
              <div className="p-6 flex flex-col gap-6">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-lg font-black">🍗</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-lg text-secondary">CHICKEN</span>
                    <span className="font-black text-lg text-white">MASTER</span>
                  </div>
                </Link>

                <nav className="flex flex-col gap-4 pt-4 border-t border-white/10">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`font-semibold transition-colors ${
                        isActive(item.path)
                          ? "text-secondary"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
