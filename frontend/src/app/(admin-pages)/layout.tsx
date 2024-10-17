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
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Admin Area</p>
          <p>You are currently in the admin section of the application.</p>
        </div>
        {children}
      </main>
    </div>
  );
}
