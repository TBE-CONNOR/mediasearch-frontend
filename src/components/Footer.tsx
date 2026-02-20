import { Link } from 'react-router';

const LEGAL_LINKS = [
  { to: '/legal#privacy', label: 'Privacy Policy' },
  { to: '/legal#terms', label: 'Terms of Service' },
  { to: '/legal#refund', label: 'Refund Policy' },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MediaSearch. All rights reserved.
        </p>

        <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:boetigsolutions@gmail.com"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            boetigsolutions@gmail.com
          </a>
          <a
            href="tel:+14433330998"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            (443) 333-0998
          </a>
        </nav>
      </div>
    </footer>
  );
}
