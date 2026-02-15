import React from 'react';
import Link from 'next/link';

interface Crumb {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex py-4 text-sm text-zinc-500">
      <ol className="flex list-none p-0">
        <li className="flex items-center">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          {items.length > 0 && <span className="mx-2 text-zinc-300">/</span>}
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.path ? (
              <Link href={item.path} className="hover:text-brand-600 transition-colors">{item.label}</Link>
            ) : (
              <span className="text-zinc-900 font-medium" aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 && <span className="mx-2 text-zinc-300">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;