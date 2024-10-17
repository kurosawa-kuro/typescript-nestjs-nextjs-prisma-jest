import Navigation from '@/components/SideBar';

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-white text-black">
      <Navigation />
      <main className="flex-grow p-8">{children}</main>
    </div>
  );
}
