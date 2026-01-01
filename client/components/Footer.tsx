export default function Footer() {
  return (
    <footer className="bg-chicken-navy text-white py-8 md:py-12">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍗</span>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-lg text-chicken-orange">CHICKEN</span>
            <span className="font-black text-lg">MASTER</span>
          </div>
        </div>
        <p className="text-gray-300 text-sm">
          © 2024 Chicken Master - Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
