import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useBitacora } from '../../contexts/BitacoraContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

const categorias = [
  'Actividad Educativa',
  'Evento Especial',
  'Salud y Bienestar',
  'Arte y Creatividad',
  'Deportes y Recreación',
  'Familia',
  'Logro o Hito',
  'Otro',
];

interface EditEntryModalProps {
  entryId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEntryModal({ entryId, onClose, onSuccess }: EditEntryModalProps) {
  const { bitacoraEntries, updateEntry } = useBitacora();
  const [isLoading, setIsLoading] = useState(false);

  // Find the entry
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    for (const entries of Object.values(bitacoraEntries)) {
      const found = entries.find((e: any) => e.id === entryId);
      if (found) {
        setEntry(found);
        setFormData({
          descripcion: found.descripcion,
          categoria: found.categoria,
          etiquetas: found.etiquetas.join(', '),
          fechaActividad: new Date(found.fechaActividad).toISOString().split('T')[0],
          visibilidad: found.visibilidad,
        });
        break;
      }
    }
  }, [entryId, bitacoraEntries]);

  const [formData, setFormData] = useState({
    descripcion: '',
    categoria: '',
    etiquetas: '',
    fechaActividad: '',
    visibilidad: 'publico' as 'publico' | 'interno',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setIsLoading(true);

    try {
      const etiquetas = formData.etiquetas
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);

      await updateEntry(entryId, {
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        etiquetas,
        fechaActividad: new Date(formData.fechaActividad).toISOString(),
        visibilidad: formData.visibilidad,
      });

      toast.success('Entrada actualizada correctamente');
      onSuccess();
    } catch (error) {
      toast.error('Error al actualizar la entrada');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Editar Entrada</DialogTitle>
        <DialogDescription>
          Actualiza la información de esta entrada de la bitácora
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Media Preview (read-only) */}
          <div>
            <Label>Archivo (no editable)</Label>
            <div className="mt-2 rounded-lg overflow-hidden bg-gray-100">
              {entry.tipo === 'foto' ? (
                <ImageWithFallback
                  src={entry.url}
                  alt={entry.descripcion}
                  className="w-full h-auto max-h-64 object-contain"
                />
              ) : (
                <video src={entry.url} controls className="w-full max-h-64" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Tipo: {entry.tipo === 'foto' ? 'Foto' : 'Video'} • Subido el{' '}
              {new Date(entry.fechaPublicacion).toLocaleDateString('es-CO')}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500">
              {formData.descripcion.length}/500
            </p>
          </div>

          {/* Category and Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaActividad">Fecha de Actividad</Label>
              <Input
                id="fechaActividad"
                type="date"
                value={formData.fechaActividad}
                onChange={(e) =>
                  setFormData({ ...formData, fechaActividad: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="etiquetas">Etiquetas</Label>
            <Input
              id="etiquetas"
              value={formData.etiquetas}
              onChange={(e) =>
                setFormData({ ...formData, etiquetas: e.target.value })
              }
              placeholder="lectura, fútbol, cumpleaños"
            />
            <p className="text-xs text-gray-500">
              Separadas por comas (máx 5)
            </p>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibilidad</Label>
            <RadioGroup
              value={formData.visibilidad}
              onValueChange={(value: any) =>
                setFormData({ ...formData, visibilidad: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="publico" id="edit-publico" />
                <Label htmlFor="edit-publico" className="cursor-pointer">
                  Visible para Padrino
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interno" id="edit-interno" />
                <Label htmlFor="edit-interno" className="cursor-pointer">
                  Solo Interno (admins)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Read-only Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subido por:</span>
              <span className="text-gray-900">{entry.uploadedByName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha de carga:</span>
              <span className="text-gray-900">
                {new Date(entry.fechaPublicacion).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
