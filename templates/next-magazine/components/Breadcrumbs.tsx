import React from 'react';
import Link from 'next/link';
import { DOMAIN } from '@/lib/constants';

interface Crumb {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const schemaList = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: DOMAIN,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.label,
      item: item.path ? `${DOMAIN}${item.path}` : undefined,
    }))
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaList
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="flex py-4 text-sm text-zinc-500">
        <ol className="flex list-none p-0">
          <li className="flex flex-wrap items-center">
            <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
            {items.length > 0 && <span className="mx-2 text-zinc-300">/</span>}
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex flex-wrap items-center">
              {item.path ? (
                <Link href={item.path} className="hover:text-brand-600 transition-colors">{item.label}</Link>
              ) : (
                <span className="text-zinc-900 font-medium whitespace-break-spaces" aria-current="page">{item.label}</span>
              )}
              {index < items.length - 1 && <span className="mx-2 text-zinc-300">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;