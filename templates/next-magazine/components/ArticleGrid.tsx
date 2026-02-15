import React from 'react';
import { Article } from '../lib/types';
import Link from 'next/link';

interface ArticleGridProps {
  articles: Article[];
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 my-12">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/article/${article.slug}`}
          className="flex flex-col cursor-pointer group animate-in"
        >
          <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/3] shadow-lg bg-zinc-100">
            <img
              src={article.image}
              alt={article.alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="space-y-3">
            <span className="text-brand-600 text-[10px] font-black uppercase tracking-[0.2em]">
              {article.category}
            </span>
            <h3 className="text-2xl font-serif font-bold leading-snug group-hover:text-brand-600 transition-colors">
              {article.title}
            </h3>
            <p className="text-zinc-500 text-base line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="flex items-center text-zinc-400 text-[11px] gap-3 pt-2">
              <span className="font-bold text-zinc-900">{article.author}</span>
              <span className="opacity-30">•</span>
              <span className="uppercase tracking-widest">{article.date}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ArticleGrid;
