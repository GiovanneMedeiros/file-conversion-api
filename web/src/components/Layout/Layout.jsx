import Header from './Header';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen text-stone-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
