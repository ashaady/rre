import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <Layout cartCount={0}>
      <div className="min-h-screen flex items-center justify-center bg-chicken-gray">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🍗</div>
          <h1 className="text-3xl font-black text-chicken-navy mb-4">
            Page non trouvée
          </h1>
          <p className="text-gray-600 mb-8">
            Cette page n'existe pas. Accédez à l'application via le menu.
          </p>
          <Link to="/" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Aller à l'accueil
          </Link>
        </div>
      </div>
    </Layout>
  );
}
