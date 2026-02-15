
import React from 'react';
import { Service } from '../lib/types';

interface ServiceSectionProps {
  services: Service[];
}

const ServiceSection: React.FC<ServiceSectionProps> = ({ services }) => {
  return (
    <section className="bg-zinc-900 text-white py-24 -mx-6 px-6 md:-mx-12 md:px-12 lg:-mx-24 lg:px-24 mt-32 rounded-[3rem] shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Servizi di Elite Digital Strategy</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Sviluppiamo ecosistemi digitali che combinano estetica superiore e ingegneria Next.js ad alte prestazioni.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {services.map((service) => (
            <div key={service.id} className="group p-10 rounded-3xl border border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-800/50 transition-all duration-500">
              <div className="w-16 h-16 bg-brand-600/10 text-brand-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-base">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
