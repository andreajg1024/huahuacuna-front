import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { useBitacora } from '../../contexts/BitacoraContext';
import { toast } from 'sonner@2.0.3';

interface PDFGenerationModalProps {
  childId: string;
  childName: string;
  onClose: () => void;
}

export function PDFGenerationModal({
  childId,
  childName,
  onClose,
}: PDFGenerationModalProps) {
  const { generatePDF, getChildStats } = useBitacora();
  const stats = getChildStats(childId);

  const [step, setStep] = useState<'config' | 'generating' | 'complete'>('config');
  const [progress, setProgress] = useState(0);

  const [config, setConfig] = useState({
    dateRange: 'all',
    dateFrom: '',
    dateTo: '',
    includeInfo: true,
    includeFotos: true,
    includeVideos: true,
    includeDescriptions: true,
    includeMetadata: true,
    imageQuality: 'media',
    format: 'vertical',
  });

  const estimatedSize = () => {
    const baseSize = 2; // 2MB base
    const photoSize = stats.totalFotos * (config.imageQuality === 'alta' ? 0.5 : config.imageQuality === 'media' ? 0.3 : 0.1);
    const videoSize = stats.totalVideos * 0.2; // screenshot
    return Math.round(baseSize + photoSize + videoSize);
  };

  const estimatedTime = () => {
    const totalEntries = (config.includeFotos ? stats.totalFotos : 0) + (config.includeVideos ? stats.totalVideos : 0);
    return Math.max(5, Math.ceil(totalEntries / 10));
  };

  const handleGenerate = async () => {
    setStep('generating');
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Generate PDF
      const blob = await generatePDF(childId, config);

      clearInterval(progressInterval);
      setProgress(100);

      // Wait a bit to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bitacora_${childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setStep('complete');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
      setStep('config');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {step === 'config' && (
          <>
            <DialogTitle>Generar Reporte de Bitácora</DialogTitle>
            <DialogDescription>
              Configura el contenido del PDF para {childName}
            </DialogDescription>

            <div className="space-y-6 mt-4">
              {/* Date Range */}
              <div className="space-y-3">
                <Label>Rango de Fechas</Label>
                <RadioGroup
                  value={config.dateRange}
                  onValueChange={(value) => setConfig({ ...config, dateRange: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      Toda la bitácora
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">
                      Rango personalizado
                    </Label>
                  </div>
                </RadioGroup>

                {config.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Desde</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={config.dateFrom}
                        onChange={(e) => setConfig({ ...config, dateFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Hasta</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={config.dateTo}
                        onChange={(e) => setConfig({ ...config, dateTo: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content to Include */}
              <div className="space-y-3">
                <Label>Contenido a Incluir</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeInfo"
                      checked={config.includeInfo}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, includeInfo: !!checked })
                      }
                    />
                    <Label htmlFor="includeInfo" className="cursor-pointer">
                      Información básica del niño
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFotos"
                      checked={config.includeFotos}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, includeFotos: !!checked })
                      }
                    />
                    <Label htmlFor="includeFotos" className="cursor-pointer">
                      Fotos ({stats.totalFotos})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeVideos"
                      checked={config.includeVideos}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, includeVideos: !!checked })
                      }
                    />
                    <Label htmlFor="includeVideos" className="cursor-pointer">
                      Videos - captura de pantalla ({stats.totalVideos})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDescriptions"
                      checked={config.includeDescriptions}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, includeDescriptions: !!checked })
                      }
                    />
                    <Label htmlFor="includeDescriptions" className="cursor-pointer">
                      Descripciones completas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={config.includeMetadata}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, includeMetadata: !!checked })
                      }
                    />
                    <Label htmlFor="includeMetadata" className="cursor-pointer">
                      Fechas y metadatos
                    </Label>
                  </div>
                </div>
              </div>

              {/* Image Quality */}
              <div className="space-y-3">
                <Label>Calidad de Imágenes</Label>
                <RadioGroup
                  value={config.imageQuality}
                  onValueChange={(value) => setConfig({ ...config, imageQuality: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alta" id="alta" />
                    <Label htmlFor="alta" className="cursor-pointer">
                      Alta (archivo grande)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="media" id="media" />
                    <Label htmlFor="media" className="cursor-pointer">
                      Media (recomendado)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="baja" id="baja" />
                    <Label htmlFor="baja" className="cursor-pointer">
                      Baja (archivo pequeño)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Format */}
              <div className="space-y-3">
                <Label>Formato</Label>
                <RadioGroup
                  value={config.format}
                  onValueChange={(value) => setConfig({ ...config, format: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vertical" id="vertical" />
                    <Label htmlFor="vertical" className="cursor-pointer">
                      PDF (A4 - Vertical)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="horizontal" id="horizontal" />
                    <Label htmlFor="horizontal" className="cursor-pointer">
                      PDF (A4 - Horizontal)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-900 mb-2">Vista Previa</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Tamaño estimado: ~{estimatedSize()} MB</p>
                  <p>Tiempo estimado: ~{estimatedTime()} segundos</p>
                  <p>
                    Entradas: {config.includeFotos ? stats.totalFotos : 0} fotos,{' '}
                    {config.includeVideos ? stats.totalVideos : 0} videos
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'generating' && (
          <>
            <DialogTitle>Generando tu reporte...</DialogTitle>
            <DialogDescription>Este proceso puede tomar unos minutos</DialogDescription>

            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <FileText className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-3">
                <Progress value={progress} className="h-3" />
                <p className="text-lg text-gray-700">{progress}%</p>
                <p className="text-sm text-gray-600">
                  {progress < 30
                    ? 'Preparando documento...'
                    : progress < 60
                    ? 'Procesando imágenes...'
                    : progress < 90
                    ? 'Generando PDF...'
                    : 'Finalizando...'}
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Puedes cerrar esta ventana y continuar navegando. Te notificaremos cuando esté listo.
              </p>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogTitle>¡Tu reporte está listo!</DialogTitle>
            <DialogDescription>El PDF se ha descargado automáticamente</DialogDescription>

            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-gray-900 mb-2">Descarga completada</h3>
                <p className="text-gray-600">
                  El archivo PDF se ha guardado en tu dispositivo
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-amber-600" />
                  <div className="text-left flex-1">
                    <p className="text-sm text-amber-900">
                      Bitacora_{childName.replace(/\s+/g, '_')}
                    </p>
                    <p className="text-xs text-amber-700">
                      PDF • {estimatedSize()} MB
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cerrar
                </Button>
                <Button
                  onClick={() => setStep('config')}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
                >
                  Generar Otro
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
