import { useState } from 'react';
import { Upload, X, FileImage, FileVideo, Loader2, Check, AlertCircle } from 'lucide-react';
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
import { Progress } from '../ui/progress';
import { useBitacora } from '../../contexts/BitacoraContext';
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

interface FileWithPreview {
  file: File;
  preview: string;
  type: 'foto' | 'video';
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

interface MultimediaUploadModalProps {
  childId: string;
  childName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MultimediaUploadModal({
  childId,
  childName,
  onClose,
  onSuccess,
}: MultimediaUploadModalProps) {
  const { addEntry, uploadFiles } = useBitacora();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fechaActividad: new Date().toISOString().split('T')[0],
    descripcion: '',
    categoria: 'Actividad Educativa',
    etiquetas: '',
    visibilidad: 'publico' as 'publico' | 'interno',
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles: File[]) => {
    const validFiles: FileWithPreview[] = [];

    selectedFiles.forEach((file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error(`${file.name}: Formato no soportado`);
        return;
      }

      // Validate file size
      const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          `${file.name}: El archivo excede el tamaño máximo (${isImage ? '5MB' : '50MB'})`
        );
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      validFiles.push({
        file,
        preview,
        type: isImage ? 'foto' : 'video',
        status: 'pending',
        progress: 0,
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Debes seleccionar al menos un archivo');
      return;
    }

    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload progress
      for (let i = 0; i < files.length; i++) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'uploading' as const } : f
          )
        );

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress } : f))
          );
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'success' as const } : f
          )
        );
      }

      // Upload files
      const actualFiles = files.map((f) => f.file);
      const urls = await uploadFiles(actualFiles, {});

      // Create entries
      const etiquetas = formData.etiquetas
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      for (let i = 0; i < files.length; i++) {
        await addEntry({
          childId,
          tipo: files[i].type,
          url: urls[i],
          thumbnailUrl: urls[i],
          descripcion: formData.descripcion,
          fechaActividad: new Date(formData.fechaActividad).toISOString(),
          categoria: formData.categoria,
          etiquetas,
          visibilidad: formData.visibilidad,
          tamano: files[i].file.size,
        });
      }

      toast.success('Entrada agregada a la bitácora');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al subir los archivos');
      console.error(error);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Agregar Entrada a la Bitácora de {childName}</DialogTitle>
        <DialogDescription>
          Documenta el progreso y momentos especiales
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <Label>
              Archivos <span className="text-red-500">*</span>
            </Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Fotos: JPG, PNG (máx 5MB c/u) • Videos: MP4 (máx 50MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label>Archivos Seleccionados ({files.length})</Label>
              <div className="grid grid-cols-2 gap-4">
                {files.map((fileItem, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 relative group"
                  >
                    {fileItem.type === 'foto' ? (
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2">
                        <img
                          src={fileItem.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                        <FileVideo className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {fileItem.type === 'foto' ? (
                          <FileImage className="w-4 h-4 text-blue-600" />
                        ) : (
                          <FileVideo className="w-4 h-4 text-purple-600" />
                        )}
                        <p className="text-sm text-gray-700 truncate flex-1">
                          {fileItem.file.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileItem.file.size)}
                      </p>

                      {fileItem.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={fileItem.progress} className="h-1" />
                          <p className="text-xs text-blue-600">
                            Subiendo... {fileItem.progress}%
                          </p>
                        </div>
                      )}

                      {fileItem.status === 'success' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-3 h-3" />
                          <p className="text-xs">Completado</p>
                        </div>
                      )}

                      {fileItem.status === 'error' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          <p className="text-xs">Error</p>
                        </div>
                      )}
                    </div>

                    {fileItem.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fechaActividad">
                Fecha de la Actividad <span className="text-red-500">*</span>
              </Label>
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
                placeholder="Describe qué está sucediendo en esta foto/video..."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-500">
                {formData.descripcion.length}/500
              </p>
            </div>

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
            </div>

            <div className="space-y-2">
              <Label>Visibilidad</Label>
              <RadioGroup
                value={formData.visibilidad}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, visibilidad: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="publico" id="publico" />
                  <Label htmlFor="publico" className="cursor-pointer">
                    Visible para Padrino
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interno" id="interno" />
                  <Label htmlFor="interno" className="cursor-pointer">
                    Solo Interno (admins)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Publicar Entrada
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
