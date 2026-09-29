import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="tabular text-7xl font-bold text-ruby">404</p>
      <h1 className="mt-4 text-2xl font-bold text-bordeaux">This page went off the loom</h1>
      <p className="mt-2 max-w-md text-sm text-bordeaux/70">
        The address you followed does not exist. Try the catalogue or head back home.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/products" className="btn-ghost">Browse products</Link>
      </div>
    </div>
  );
}
