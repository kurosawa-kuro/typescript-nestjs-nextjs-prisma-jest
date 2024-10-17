import Navigation from '@/components/Navigation';

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white text-black">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
