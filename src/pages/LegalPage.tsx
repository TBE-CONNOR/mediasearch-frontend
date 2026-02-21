import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { Footer } from '@/components/Footer';

import privacyPolicy from '@/content/legal/privacy-policy.md?raw';
import termsOfService from '@/content/legal/terms-of-service.md?raw';
import refundPolicy from '@/content/legal/refund-policy.md?raw';

const TABS = [
  { id: 'privacy', label: 'Privacy Policy', content: privacyPolicy },
  { id: 'terms', label: 'Terms of Service', content: termsOfService },
  { id: 'refund', label: 'Refund Policy', content: refundPolicy },
] as const;

type TabId = (typeof TABS)[number]['id'];

function getTabFromHash(): TabId {
  const hash = window.location.hash.replace('#', '');
  if (TABS.some((t) => t.id === hash)) return hash as TabId;
  return 'privacy';
}

export function LegalPage() {
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromHash);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Legal — MediaSearch';
    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
  };

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      <header className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/"
            className="text-xl font-bold text-white hover:text-blue-400"
          >
            MediaSearch
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-white">Legal</h1>

          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- roving tabIndex on child tabs */}
          <div
            className="mb-8 flex gap-1 overflow-x-auto rounded-lg bg-zinc-800 p-1"
            role="tablist"
            aria-label="Legal documents"
            onKeyDown={(e) => {
              const idx = TABS.findIndex((t) => t.id === activeTab);
              let next = idx;
              if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
              else if (e.key === 'ArrowLeft')
                next = (idx - 1 + TABS.length) % TABS.length;
              else return;
              e.preventDefault();
              handleTabClick(TABS[next].id);
              (e.currentTarget.children[next] as HTMLElement).focus();
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                tabIndex={activeTab === tab.id ? 0 : -1}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="rounded-lg bg-zinc-900/50 p-6 sm:p-10"
          >
            <article className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{currentTab.content}</ReactMarkdown>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
