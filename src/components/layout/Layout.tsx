import Header from './Header';
import BottomNav from './BottomNav';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
