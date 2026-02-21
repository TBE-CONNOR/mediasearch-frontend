import { Link } from 'react-router';

const CONTACT_EMAIL = 'boetigsolutions@gmail.com';
const CONTACT_PHONE = '(443) 333-0998';
const CONTACT_PHONE_HREF = 'tel:+14433330998';

const LEGAL_LINKS = [
  { to: '/legal#privacy', label: 'Privacy Policy' },
  { to: '/legal#terms', label: 'Terms of Service' },
  { to: '/legal#refund', label: 'Refund Policy' },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} MediaSearch. All rights reserved.
        </p>

        <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded text-sm text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded text-sm text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={CONTACT_PHONE_HREF}
            className="rounded text-sm text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {CONTACT_PHONE}
          </a>
        </nav>
      </div>
    </footer>
  );
}
