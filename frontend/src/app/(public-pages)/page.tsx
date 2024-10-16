import Link from 'next/link';

export default function PublicPages() {
  return (
    <div>
      <h1>Public Pages</h1>
      <nav>
        <ul>
          <li>
            <Link href="/profile">Profile</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
