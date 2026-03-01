import React from 'react';

interface YouTubeVideoProps {
    videoId: string;
    title?: string;
}

const getYouTubeId = (urlOrId: string) => {
    if (!urlOrId || urlOrId === 'No selection' || urlOrId.includes(' ')) return null;
    if (urlOrId.length === 11) return urlOrId;
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : (urlOrId.length === 11 ? urlOrId : null);
};

const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ videoId, title = "Video di Approfondimento" }) => {
    const cleanId = getYouTubeId(videoId);
    if (!cleanId) return null;

    return (
        <section className="my-24 overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-2xl border border-zinc-800">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                    src={`https://www.youtube.com/embed/${cleanId}?rel=0&autoplay=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                ></iframe>
            </div>
            <div className="p-8 md:p-12 text-center bg-zinc-900 border-t border-zinc-800">
                <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">Approfondimento Video</h3>
                <p className="text-zinc-400 max-w-2xl mx-auto italic">
                    Abbiamo selezionato questo contenuto per aiutarti a comprendere meglio le sfide e le soluzioni nel nostro settore.
                </p>
            </div>
        </section>
    );
};

export default YouTubeVideo;
