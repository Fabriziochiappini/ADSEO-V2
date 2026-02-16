"use client";

import React from 'react';
import { Article } from '../lib/types';
import Link from 'next/link';

interface MagazineHeroProps {
  article: Article;
  onSelect?: (article: Article) => void;
}

const MagazineHero: React.FC<MagazineHeroProps> = ({ article, onSelect }) => {
  return (
    <Link
      href={`/article/${article.slug}`}
      onClick={(e) => {
        if (onSelect) {
          e.preventDefault();
          onSelect(article);
        }
      }}
    >
      <article
        className="group relative h-[600px] w-full overflow-hidden rounded-3xl cursor-pointer bg-zinc-900 shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={article.alt}
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-4xl">
          <span className="inline-block bg-brand-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
            In Primo Piano: {article.category}
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6 font-bold">
            {article.title}
          </h2>
          <p className="text-zinc-200 text-lg md:text-xl line-clamp-2 mb-8 opacity-90 font-medium">
            {article.excerpt}
          </p>
          <div className="flex items-center text-zinc-300 text-sm gap-4">
            <span className="font-bold text-white tracking-wide">{article.author}</span>
            <span className="opacity-30">•</span>
            <span className="uppercase tracking-widest text-[11px]">{article.date}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default MagazineHero;
