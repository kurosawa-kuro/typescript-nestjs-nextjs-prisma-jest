import Navigation from '@/components/Navigation';

export default function PublicPagesLayout({
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
