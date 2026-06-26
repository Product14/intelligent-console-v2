import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <h2 className="text-typography-900 text-4xl font-bold">
          404 - Not Found
        </h2>
        <p className="text-typography-600 text-lg">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/home"
          className="bg-blue-light hover:bg-blue-light inline-block rounded-lg px-4 py-2 text-white transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
