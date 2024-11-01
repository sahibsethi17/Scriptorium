import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Authentication App</h1>
      <p className="mb-6">This is a simple application with JWT-based authentication using Next.js.</p>

      <div className="flex justify-center space-x-4">
        <Link href="/signup">
          <a className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</a>
        </Link>
        <Link href="/login">
          <a className="bg-green-500 text-white px-4 py-2 rounded">Log In</a>
        </Link>
      </div>

      <p className="mt-6">
        Already logged in? Go to your{' '}
        <Link href="/dashboard">
          <a className="text-blue-600 underline">Dashboard</a>
        </Link>.
      </p>
    </div>
  );
}
