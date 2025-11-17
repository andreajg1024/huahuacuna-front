import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useBitacora } from '../../contexts/BitacoraContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface MediaLightboxProps {
  entryId: string;
  onClose: () => void;
}

export function MediaLightbox({ entryId, onClose }: MediaLightboxProps) {
  const { bitacoraEntries } = useBitacora();
  
  // Find the entry and all entries from the same child
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [allChildEntries, setAllChildEntries] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Find the current entry
    let found = null;
    let childId = null;
    
    for (const [cid, entries] of Object.entries(bitacoraEntries)) {
      const entry = entries.find((e: any) => e.id === entryId);
      if (entry) {
        found = entry;
        childId = cid;
        break;
      }
    }

    if (found && childId) {
      setCurrentEntry(found);
      const childEntries = bitacoraEntries[childId] || [];
      setAllChildEntries(childEntries);
      setCurrentIndex(childEntries.findIndex((e: any) => e.id === entryId));
    }
  }, [entryId, bitacoraEntries]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allChildEntries]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentEntry(allChildEntries[newIndex]);
      setZoom(1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allChildEntries.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentEntry(allChildEntries[newIndex]);
      setZoom(1);
    }
  };

  const handleDownload = () => {
    if (!currentEntry) return;
    
    // In real app, would trigger actual download
    const link = document.createElement('a');
    link.href = currentEntry.url;
    link.download = `${currentEntry.descripcion.slice(0, 20)}.jpg`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!currentEntry) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {currentIndex < allChildEntries.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Zoom Controls */}
      {currentEntry.tipo === 'foto' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 rounded-full p-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.max(0.5, zoom - 0.25));
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <span className="text-white text-sm px-3">{Math.round(zoom * 100)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.min(3, zoom + 0.25));
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div
        className="max-w-7xl max-h-[90vh] w-full mx-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentEntry.tipo === 'foto' ? (
          <div className="flex items-center justify-center max-h-[80vh] overflow-auto">
            <img
              src={currentEntry.url}
              alt={currentEntry.descripcion}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        ) : (
          <video
            src={currentEntry.url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-lg"
          />
        )}
      </div>

      {/* Info Panel */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-white/20 text-white border-white/30">
                  {formatDate(currentEntry.fechaActividad)}
                </Badge>
                <Badge className="bg-amber-500 text-white">
                  {currentEntry.categoria}
                </Badge>
                <span className="text-white/70 text-sm">
                  {currentIndex + 1} de {allChildEntries.length}
                </span>
              </div>
              <p className="text-white text-lg mb-3">{currentEntry.descripcion}</p>
              {currentEntry.etiquetas.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {currentEntry.etiquetas.map((tag: string) => (
                    <Badge key={tag} className="bg-white/10 text-white border-white/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {allChildEntries.length > 1 && (
        <div className="absolute bottom-32 left-0 right-0 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
              {allChildEntries.map((entry: any, index: number) => (
                <button
                  key={entry.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    setCurrentEntry(entry);
                    setZoom(1);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-amber-500 scale-110'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={entry.tipo === 'foto' ? entry.url : entry.thumbnailUrl || entry.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

