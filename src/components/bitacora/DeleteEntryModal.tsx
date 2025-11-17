import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { useBitacora } from '../../contexts/BitacoraContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const deleteReasons = [
  'Contenido duplicado',
  'Error en la carga',
  'Contenido inapropiado',
  'Solicitud del padrino',
  'Otro',
];

interface DeleteEntryModalProps {
  entryId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteEntryModal({ entryId, onClose, onConfirm }: DeleteEntryModalProps) {
  const { bitacoraEntries, deleteEntry } = useBitacora();
  const [isLoading, setIsLoading] = useState(false);

  // Find the entry
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    for (const entries of Object.values(bitacoraEntries)) {
      const found = entries.find((e: any) => e.id === entryId);
      if (found) {
        setEntry(found);
        break;
      }
    }
  }, [entryId, bitacoraEntries]);

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!reason) {
      toast.error('Debes seleccionar una razón');
      return;
    }

    if (!confirmed) {
      toast.error('Debes confirmar que deseas eliminar esta entrada');
      return;
    }

    setIsLoading(true);

    try {
      const fullReason = details ? `${reason}: ${details}` : reason;
      await deleteEntry(entryId, fullReason);
      
      toast.success('Entrada eliminada correctamente');
      onConfirm();
    } catch (error) {
      toast.error('Error al eliminar la entrada');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogTitle>¿Eliminar esta entrada?</DialogTitle>
        <DialogDescription>
          Esta acción no se puede deshacer
        </DialogDescription>

        <div className="space-y-6 mt-4">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="mb-1">
                Estás a punto de eliminar permanentemente esta entrada de la bitácora.
              </p>
              <p>
                Esta acción quedará registrada en el historial de auditoría.
              </p>
            </div>
          </div>

          {/* Entry Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <Label className="text-gray-500 mb-3 block">Vista Previa de la Entrada</Label>
            <div className="flex gap-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                {entry.tipo === 'foto' ? (
                  <ImageWithFallback
                    src={entry.url}
                    alt={entry.descripcion}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageWithFallback
                    src={entry.thumbnailUrl || entry.url}
                    alt={entry.descripcion}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(entry.fechaActividad).toLocaleDateString('es-CO')}
                </p>
                <p className="text-sm text-gray-900 line-clamp-3">
                  {entry.descripcion}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {entry.tipo === 'foto' ? 'Foto' : 'Video'} • {entry.categoria}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Razón de Eliminación <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una razón" />
              </SelectTrigger>
              <SelectContent>
                {deleteReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Detalles Adicionales (Opcional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Proporciona más información sobre por qué se elimina esta entrada..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{details.length}/500</p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(!!checked)}
            />
            <Label htmlFor="confirm" className="cursor-pointer leading-relaxed text-sm">
              Entiendo que esto eliminará la entrada permanentemente de la bitácora.
              Esta acción quedará registrada en el historial de auditoría.
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!reason || !confirmed || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Eliminando...' : 'Eliminar Entrada'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

