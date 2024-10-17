import AdminSideBar from '@/components/AdminSideBar';

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-white text-black">
      <AdminSideBar />
      <main className="flex-grow p-8">
        {children}
      </main>
    </div>
  );
}
