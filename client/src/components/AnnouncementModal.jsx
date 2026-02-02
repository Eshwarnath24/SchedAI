import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

const AnnouncementModal = ({ isOpen, onClose, announcement }) => {
  if (!isOpen || !announcement) return null;

  const renderContent = () => {
    switch (announcement.contentType) {
      case 'image':
        return (
          <div className="text-center">
            <img
              src={announcement.asset}
              alt={announcement.title}
              className="max-w-full max-h-96 object-contain rounded-2xl mx-auto"
            />
            {announcement.asset && (
              <a
                href={announcement.asset}
                download
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#8B0000] text-white rounded-2xl font-semibold hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Image
              </a>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="text-center">
            <div className="bg-red-50 p-8 rounded-2xl mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">PDF</span>
              </div>
              <p className="text-red-700 font-semibold">PDF Document</p>
              <p className="text-red-600 text-sm mt-1">{announcement.asset?.split('/').pop()}</p>
            </div>
            {announcement.asset && (
              <div className="flex gap-3 justify-center">
                <a
                  href={announcement.asset}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B0000] text-white rounded-2xl font-semibold hover:bg-red-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View PDF
                </a>
                <a
                  href={announcement.asset}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="text-center">
            <div className="bg-blue-50 p-8 rounded-2xl mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-700 font-semibold">External Link</p>
              <p className="text-blue-600 text-sm mt-1 break-all">{announcement.link}</p>
            </div>
            {announcement.link && (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B0000] text-white rounded-2xl font-semibold hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </a>
            )}
          </div>
        );

      default:
        return (
          <div className="prose prose-lg max-w-none">
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#8B0000] p-8 text-white flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-2xl font-black tracking-tight mb-2">{announcement.title}</h3>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>{new Date(announcement.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <span>•</span>
              <span>{announcement.author}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;