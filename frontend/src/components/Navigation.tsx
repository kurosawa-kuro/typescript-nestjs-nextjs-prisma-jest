import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <ul className="flex space-x-4">
        <li>
          <Link href="/">Public</Link>
        </li>
        <li>
          <Link href="/profile">Profile</Link>
        </li>
        <li>
          <Link href="/admin">Admin</Link>
        </li>
        <li>
          <Link href="/login">Login</Link>
        </li>
        <li>
          <Link href="/register">Register</Link>
        </li>
      </ul>
    </nav>
  );
}
