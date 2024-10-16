import Navigation from '@/components/Navigation';

export default function UserPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
