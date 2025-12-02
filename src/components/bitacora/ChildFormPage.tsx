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
import { toast } from 'sonner';
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
    firstName: existingChild?.nombre || '',
    lastName: existingChild?.apellidos || '',
    dateOfBirth: existingChild?.fechaNacimiento || '',
    gender: existingChild?.genero === 'masculino' ? 'MALE' : 'FEMALE',
    municipality: existingChild?.municipio || '',
    address: existingChild?.direccion || '',
    photo: existingChild?.foto || '',
    shortDescription: '',
    fullStory: existingChild?.historia || '',
    ethnicity: '',
    specialCondition: '',
    needs: existingChild?.necesidades || [] as string[],
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

  const age = calculateAge(formData.dateOfBirth);

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
    
    // Por ahora usar preview local, en producción subir a servidor
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // TODO: Implementar upload a servidor de imágenes
    // const uploadedUrl = await uploadImage(file);
    // setFormData({ ...formData, photo: uploadedUrl });
    toast.info('Nota: La foto se guardará como URL temporal. Implementa upload a servidor para producción.');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Los apellidos son requeridos';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    if (!formData.gender) newErrors.gender = 'El género es requerido';
    if (!formData.municipality) newErrors.municipality = 'El municipio es requerido';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'La descripción corta es requerida';
    if (!formData.fullStory.trim()) newErrors.fullStory = 'La historia es requerida';

    // Validate age (5-18 years)
    if (formData.dateOfBirth) {
      const ageYears = calculateAge(formData.dateOfBirth).years;
      if (ageYears < 5 || ageYears > 18) {
        newErrors.dateOfBirth = 'La edad debe estar entre 5 y 18 años';
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
      // Preparar datos según el formato del backend (CreateChildDTO)
      const childData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        municipality: formData.municipality,
        shortDescription: formData.shortDescription.trim(),
        fullStory: formData.fullStory.trim(),
        ethnicity: formData.ethnicity?.trim() || undefined,
        specialCondition: formData.specialCondition?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        // IMPORTANTE: Enviar solo URL, NO base64 (límite del backend es 100KB)
        photo: formData.photo || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
        photos: [],
        needs: formData.needs.length > 0 ? formData.needs : undefined,
      };

      console.log('[ChildForm] Enviando datos:', childData);
      console.log('[ChildForm] Tamaño aproximado:', JSON.stringify(childData).length, 'bytes');

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
      console.error('[ChildForm] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNecesidadToggle = (necesidad: string) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(necesidad)
        ? prev.needs.filter((n) => n !== necesidad)
        : [...prev.needs, necesidad],
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
                <Label htmlFor="firstName">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {/* Birth Date and Gender */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {formData.dateOfBirth && (
                  <p className="text-sm text-gray-600">
                    Edad: {age.years} años, {age.months} meses
                  </p>
                )}
                {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Género <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="MALE" />
                    <Label htmlFor="MALE" className="cursor-pointer">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="FEMALE" />
                    <Label htmlFor="FEMALE" className="cursor-pointer">
                      Femenino
                    </Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
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
                <Label htmlFor="municipality">
                  Municipio <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.municipality} onValueChange={(value) => setFormData({ ...formData, municipality: value })}>
                  <SelectTrigger className={errors.municipality ? 'border-red-500' : ''}>
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
                {errors.municipality && <p className="text-sm text-red-600">{errors.municipality}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección (Opcional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Barrio, calle, número"
                rows={2}
                maxLength={200}
              />
              <p className="text-sm text-gray-500">{formData.address?.length || 0}/200</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 - Child Information */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Información del Niño</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shortDescription">
                Descripción Corta <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Breve descripción del niño (ej: 'Niño alegre y juguetón que le gusta el fútbol')"
                rows={2}
                maxLength={200}
                className={errors.shortDescription ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500">{formData.shortDescription.length}/200</p>
              {errors.shortDescription && <p className="text-sm text-red-600">{errors.shortDescription}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullStory">
                Historia Completa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="fullStory"
                value={formData.fullStory}
                onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                placeholder="Historia del niño, su contexto familiar y situación actual..."
                rows={6}
                maxLength={2000}
                className={errors.fullStory ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500">{formData.fullStory.length}/2000</p>
              {errors.fullStory && <p className="text-sm text-red-600">{errors.fullStory}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ethnicity">Etnia (Opcional)</Label>
                <Input
                  id="ethnicity"
                  value={formData.ethnicity}
                  onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                  placeholder="Ej: Quechua, Mesético, etc."
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialCondition">Condición Especial (Opcional)</Label>
                <Input
                  id="specialCondition"
                  value={formData.specialCondition}
                  onChange={(e) => setFormData({ ...formData, specialCondition: e.target.value })}
                  placeholder="Ej: Alergia al gluten, etc."
                  maxLength={200}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 - Needs */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Necesidades</h3>
            <p className="text-sm text-gray-600">Selecciona las necesidades específicas del niño</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {necesidadesComunes.map((necesidad) => (
                <div key={necesidad} className="flex items-center space-x-2">
                  <Checkbox
                    id={necesidad}
                    checked={formData.needs.includes(necesidad)}
                    onCheckedChange={() => handleNecesidadToggle(necesidad)}
                  />
                  <Label htmlFor={necesidad} className="cursor-pointer">
                    {necesidad}
                  </Label>
                </div>
              ))}
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

