import { useState, useRef } from 'react';
import { Camera, Save, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useBitacora } from '../../contexts/BitacoraContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ChildFormPageProps {
  childId?: string;
  onNavigate?: (page: string) => void;
}

const municipios = [
  'Armenia',
  'Calarcá',
  'Circasia',
  'Córdoba',
  'Filandia',
  'La Tebaida',
  'Montenegro',
  'Pijao',
  'Quimbaya',
  'Salento',
];

const grados = [
  'Preescolar',
  '1° Primaria',
  '2° Primaria',
  '3° Primaria',
  '4° Primaria',
  '5° Primaria',
  '6° Bachillerato',
  '7° Bachillerato',
  '8° Bachillerato',
  '9° Bachillerato',
  '10° Bachillerato',
  '11° Bachillerato',
];

const necesidadesComunes = [
  'Apoyo educativo',
  'Atención médica',
  'Terapias especializadas',
  'Material escolar',
  'Alimentación',
];

export function ChildFormPage({ childId, onNavigate }: ChildFormPageProps) {
  const { getChildById, addChild, updateChild } = useBitacora();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingChild = childId ? getChildById(childId) : null;
  const isEditing = !!existingChild;

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(existingChild?.foto || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nombre: existingChild?.nombre || '',
    apellidos: existingChild?.apellidos || '',
    fechaNacimiento: existingChild?.fechaNacimiento || '',
    genero: existingChild?.genero || 'femenino',
    municipio: existingChild?.municipio || '',
    direccion: existingChild?.direccion || '',
    institucion: existingChild?.institucion || '',
    grado: existingChild?.grado || '',
    jornada: existingChild?.jornada || 'mañana',
    historia: existingChild?.historia || '',
    suenos: existingChild?.suenos || '',
    situacionFamiliar: existingChild?.situacionFamiliar || '',
    necesidades: existingChild?.necesidades || [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return { years: 0, months: 0 };
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return { years, months: months < 0 ? 12 + months : months };
  };

  const age = calculateAge(formData.fechaNacimiento);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!formData.genero) newErrors.genero = 'El género es requerido';
    if (!formData.municipio) newErrors.municipio = 'El municipio es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.institucion.trim()) newErrors.institucion = 'La institución es requerida';
    if (!formData.grado) newErrors.grado = 'El grado es requerido';

    if (!isEditing && !photoFile) newErrors.foto = 'La foto es requerida';

    // Validate age (5-18 years)
    if (formData.fechaNacimiento) {
      const ageYears = calculateAge(formData.fechaNacimiento).years;
      if (ageYears < 5 || ageYears > 18) {
        newErrors.fechaNacimiento = 'La edad debe estar entre 5 y 18 años';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      const childData = {
        ...formData,
        edad: age.years,
        foto: photoPreview || existingChild?.foto || '',
        estadoApadrinamiento: existingChild?.estadoApadrinamiento || 'disponible',
        padrinoId: existingChild?.padrinoId,
      } as any;

      if (isEditing && existingChild) {
        await updateChild(existingChild.id, childData);
        toast.success('Información actualizada correctamente');
      } else {
        await addChild(childData);
        toast.success('Niño registrado correctamente');
      }

      if (onNavigate) {
        onNavigate('children-management');
      }
    } catch (error) {
      toast.error('Error al guardar la información');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNecesidadToggle = (necesidad: string) => {
    setFormData((prev) => ({
      ...prev,
      necesidades: prev.necesidades.includes(necesidad)
        ? prev.necesidades.filter((n) => n !== necesidad)
        : [...prev.necesidades, necesidad],
    }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          {isEditing ? `Editar Información de ${existingChild.nombre}` : 'Registrar Nuevo Niño'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Actualiza la información del niño' : 'Completa la información básica del niño'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 - Personal Information */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Información Personal</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-200">
                  {photoPreview ? (
                    <ImageWithFallback
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera className="w-8 h-8" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button type="button" onClick={handlePhotoClick} variant="outline" size="sm">
                {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
              </Button>
              {errors.foto && <p className="text-sm text-red-600">{errors.foto}</p>}
              <p className="text-sm text-gray-500">JPG o PNG, máximo 5MB</p>
            </div>

            {/* Name */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={errors.nombre ? 'border-red-500' : ''}
                />
                {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">
                  Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className={errors.apellidos ? 'border-red-500' : ''}
                />
                {errors.apellidos && <p className="text-sm text-red-600">{errors.apellidos}</p>}
              </div>
            </div>

            {/* Birth Date and Gender */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className={errors.fechaNacimiento ? 'border-red-500' : ''}
                />
                {formData.fechaNacimiento && (
                  <p className="text-sm text-gray-600">
                    Edad: {age.years} años, {age.months} meses
                  </p>
                )}
                {errors.fechaNacimiento && <p className="text-sm text-red-600">{errors.fechaNacimiento}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Género <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.genero}
                  onValueChange={(value: any) => setFormData({ ...formData, genero: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino" className="cursor-pointer">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femenino" id="femenino" />
                    <Label htmlFor="femenino" className="cursor-pointer">
                      Femenino
                    </Label>
                  </div>
                </RadioGroup>
                {errors.genero && <p className="text-sm text-red-600">{errors.genero}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 - Location */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Ubicación</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Input id="departamento" value="Quindío" disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">
                  Municipio <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.municipio} onValueChange={(value) => setFormData({ ...formData, municipio: value })}>
                  <SelectTrigger className={errors.municipio ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map((mun) => (
                      <SelectItem key={mun} value={mun}>
                        {mun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipio && <p className="text-sm text-red-600">{errors.municipio}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">
                Dirección <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Barrio, calle, número"
                rows={2}
                maxLength={200}
                className={errors.direccion ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500">{formData.direccion.length}/200</p>
              {errors.direccion && <p className="text-sm text-red-600">{errors.direccion}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section 3 - Educational Information */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Información Educativa</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="institucion">
                Institución Educativa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="institucion"
                value={formData.institucion}
                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                placeholder="Nombre de la escuela o colegio"
                className={errors.institucion ? 'border-red-500' : ''}
              />
              {errors.institucion && <p className="text-sm text-red-600">{errors.institucion}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grado">
                  Grado Escolar <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.grado} onValueChange={(value) => setFormData({ ...formData, grado: value })}>
                  <SelectTrigger className={errors.grado ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {grados.map((grado) => (
                      <SelectItem key={grado} value={grado}>
                        {grado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grado && <p className="text-sm text-red-600">{errors.grado}</p>}
              </div>

              <div className="space-y-2">
                <Label>Jornada</Label>
                <RadioGroup
                  value={formData.jornada}
                  onValueChange={(value: any) => setFormData({ ...formData, jornada: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mañana" id="mañana" />
                    <Label htmlFor="mañana" className="cursor-pointer">
                      Mañana
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tarde" id="tarde" />
                    <Label htmlFor="tarde" className="cursor-pointer">
                      Tarde
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="completa" id="completa" />
                    <Label htmlFor="completa" className="cursor-pointer">
                      Completa
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 - Additional Information */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Información Adicional</h3>
            <p className="text-sm text-gray-600">Opcional - ayuda a conocer mejor al niño</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="historia">Historia del Niño</Label>
              <Textarea
                id="historia"
                value={formData.historia}
                onChange={(e) => setFormData({ ...formData, historia: e.target.value })}
                placeholder="Describe brevemente su historia y contexto..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-sm text-gray-500">{formData.historia.length}/2000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suenos">Sueños y Aspiraciones</Label>
              <Textarea
                id="suenos"
                value={formData.suenos}
                onChange={(e) => setFormData({ ...formData, suenos: e.target.value })}
                placeholder="¿Qué sueña con ser o hacer en el futuro?"
                rows={3}
                maxLength={500}
              />
              <p className="text-sm text-gray-500">{formData.suenos.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situacionFamiliar">Situación Familiar</Label>
              <Textarea
                id="situacionFamiliar"
                value={formData.situacionFamiliar}
                onChange={(e) => setFormData({ ...formData, situacionFamiliar: e.target.value })}
                placeholder="Contexto familiar (solo visible para administradores)"
                rows={3}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500">Privado - {formData.situacionFamiliar.length}/1000</p>
            </div>

            <div className="space-y-3">
              <Label>Necesidades Específicas</Label>
              <div className="space-y-2">
                {necesidadesComunes.map((necesidad) => (
                  <div key={necesidad} className="flex items-center space-x-2">
                    <Checkbox
                      id={necesidad}
                      checked={formData.necesidades.includes(necesidad)}
                      onCheckedChange={() => handleNecesidadToggle(necesidad)}
                    />
                    <Label htmlFor={necesidad} className="cursor-pointer">
                      {necesidad}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Guardar Cambios' : 'Registrar Niño'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate && onNavigate('children-management')}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
