import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, X, FileText, CheckCircle2, AlertCircle, 
  ArrowLeft, ArrowRight, Heart, Loader2
} from 'lucide-react';
import { useVolunteering, type VolunteerArea, type VolunteerReference } from '../../contexts/VolunteeringContext';
import { toast } from 'sonner';

interface VolunteerApplicationFormProps {
  onClose?: () => void;
}

const VOLUNTEER_AREAS: VolunteerArea[] = [
  'Educación y Refuerzo Escolar',
  'Arte y Creatividad',
  'Deportes y Recreación',
  'Tecnología y Computación',
  'Salud y Bienestar',
  'Cocina y Alimentación',
  'Administración y Logística',
  'Comunicaciones y Marketing',
  'Mantenimiento y Oficios',
  'Otro'
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORARIOS = ['Mañana (6am - 12pm)', 'Tarde (12pm - 6pm)', 'Noche (6pm - 10pm)'];

export const VolunteerApplicationForm: React.FC<VolunteerApplicationFormProps> = ({ onClose }) => {
  const { addApplication, sendConfirmationEmail } = useVolunteering();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    foto: '',
    nombreCompleto: '',
    tipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: '',
    email: '',
    telefono: '',
    whatsapp: '',
    sameWhatsApp: true,
    direccion: '',
    ciudad: 'Armenia',
    departamento: 'Quindío',
    
    // Step 2 - Volunteering Info
    areasInteres: [] as VolunteerArea[],
    otraArea: '',
    habilidades: '',
    tieneExperienciaPrevia: '',
    experienciaPrevia: '',
    motivacion: '',
    queEsperaAportar: '',
    
    // Step 3 - Availability
    diasDisponibles: [] as string[],
    horariosDisponibles: [] as string[],
    horasPorSemana: 4,
    compromisoTiempo: '3 meses',
    fechaInicioPreferida: '',
    restriccionesHorario: '',
    
    // Step 4 - References & Documents
    referencias: [
      { nombre: '', relacion: '', telefono: '', email: '' }
    ] as VolunteerReference[],
    cvFile: null as File | null,
    cvUrl: '',
    cartaMotivacionFile: null as File | null,
    cartaMotivacionUrl: '',
    certificadosFiles: [] as File[],
    certificadosUrls: [] as string[],
    comoSeEntero: '',
    
    // Step 5 - Terms
    autorizaDatos: false,
    compromisoVoluntariado: false,
    disponibleEntrevista: false,
    declaracionVeracidad: false,
    newsletter: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const toggleArea = (area: VolunteerArea) => {
    const current = formData.areasInteres;
    if (current.includes(area)) {
      updateField('areasInteres', current.filter(a => a !== area));
    } else {
      if (current.length < 3) {
        updateField('areasInteres', [...current, area]);
      } else {
        toast.error('Máximo 3 áreas de interés');
      }
    }
  };

  const toggleDia = (dia: string) => {
    const current = formData.diasDisponibles;
    if (current.includes(dia)) {
      updateField('diasDisponibles', current.filter(d => d !== dia));
    } else {
      updateField('diasDisponibles', [...current, dia]);
    }
  };

  const toggleHorario = (horario: string) => {
    const current = formData.horariosDisponibles;
    if (current.includes(horario)) {
      updateField('horariosDisponibles', current.filter(h => h !== horario));
    } else {
      updateField('horariosDisponibles', [...current, horario]);
    }
  };

  const addReferencia = () => {
    if (formData.referencias.length < 2) {
      updateField('referencias', [
        ...formData.referencias,
        { nombre: '', relacion: '', telefono: '', email: '' }
      ]);
    }
  };

  const updateReferencia = (index: number, field: keyof VolunteerReference, value: string) => {
    const newReferencias = [...formData.referencias];
    newReferencias[index] = { ...newReferencias[index], [field]: value };
    updateField('referencias', newReferencias);
  };

  const removeReferencia = (index: number) => {
    if (formData.referencias.length > 1) {
      updateField('referencias', formData.referencias.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (file: File, type: 'cv' | 'carta' | 'certificado') => {
    // Validate file
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (type === 'cv' && file.type !== 'application/pdf') {
      toast.error('El CV debe ser un archivo PDF');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('El archivo no debe exceder 2MB');
      return;
    }

    // Simulate upload - in real app would upload to cloud storage
    const fakeUrl = URL.createObjectURL(file);
    
    if (type === 'cv') {
      updateField('cvFile', file);
      updateField('cvUrl', fakeUrl);
      toast.success('CV cargado exitosamente');
    } else if (type === 'carta') {
      updateField('cartaMotivacionFile', file);
      updateField('cartaMotivacionUrl', fakeUrl);
      toast.success('Carta de motivación cargada');
    } else if (type === 'certificado') {
      if (formData.certificadosFiles.length < 5) {
        updateField('certificadosFiles', [...formData.certificadosFiles, file]);
        updateField('certificadosUrls', [...formData.certificadosUrls, fakeUrl]);
        toast.success('Certificado cargado');
      } else {
        toast.error('Máximo 5 certificados');
      }
    }
  };

  const removeCertificado = (index: number) => {
    updateField('certificadosFiles', formData.certificadosFiles.filter((_, i) => i !== index));
    updateField('certificadosUrls', formData.certificadosUrls.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nombreCompleto.trim()) newErrors.nombreCompleto = 'El nombre es requerido';
      if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'El documento es requerido';
      if (!formData.fechaNacimiento) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
      } else {
        const age = calculateAge(formData.fechaNacimiento);
        if (age < 16) newErrors.fechaNacimiento = 'Debes tener al menos 16 años';
        if (age > 80) newErrors.fechaNacimiento = 'Edad inválida';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
      if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    }

    if (step === 2) {
      if (formData.areasInteres.length === 0) {
        newErrors.areasInteres = 'Selecciona al menos un área de interés';
      }
      if (!formData.habilidades.trim()) {
        newErrors.habilidades = 'Las habilidades son requeridas';
      }
      if (!formData.motivacion.trim()) {
        newErrors.motivacion = 'La motivación es requerida';
      }
    }

    if (step === 3) {
      if (formData.diasDisponibles.length === 0) {
        newErrors.diasDisponibles = 'Selecciona al menos un día';
      }
      if (formData.horariosDisponibles.length === 0) {
        newErrors.horariosDisponibles = 'Selecciona al menos un horario';
      }
      if (formData.horasPorSemana < 4) {
        newErrors.horasPorSemana = 'Mínimo 4 horas semanales';
      }
    }

    if (step === 4) {
      const ref = formData.referencias[0];
      if (!ref.nombre.trim()) newErrors.referencia1Nombre = 'El nombre de la referencia es requerido';
      if (!ref.telefono.trim()) newErrors.referencia1Telefono = 'El teléfono de la referencia es requerido';
      if (!formData.cvUrl) newErrors.cv = 'El CV es requerido';
    }

    if (step === 5) {
      if (!formData.autorizaDatos) newErrors.autorizaDatos = 'Debes autorizar el tratamiento de datos';
      if (!formData.compromisoVoluntariado) newErrors.compromisoVoluntariado = 'Debes aceptar el compromiso';
      if (!formData.disponibleEntrevista) newErrors.disponibleEntrevista = 'Debes estar disponible para entrevista';
      if (!formData.declaracionVeracidad) newErrors.declaracionVeracidad = 'Debes declarar que la información es verídica';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare application data
      const age = calculateAge(formData.fechaNacimiento);
      
      let finalAreas = [...formData.areasInteres];
      if (formData.otraArea.trim() && formData.areasInteres.includes('Otro')) {
        finalAreas = finalAreas.filter(a => a !== 'Otro');
        finalAreas.push(formData.otraArea.trim() as VolunteerArea);
      }

      const applicationData = {
        foto: formData.foto,
        nombreCompleto: formData.nombreCompleto.trim(),
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        edad: age,
        genero: formData.genero,
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        whatsapp: formData.sameWhatsApp ? formData.telefono.trim() : formData.whatsapp.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad,
        departamento: formData.departamento,
        areasInteres: finalAreas,
        habilidades: formData.habilidades.trim(),
        experienciaPrevia: formData.tieneExperienciaPrevia === 'si' ? formData.experienciaPrevia : undefined,
        motivacion: formData.motivacion.trim(),
        queEsperaAportar: formData.queEsperaAportar.trim(),
        diasDisponibles: formData.diasDisponibles,
        horariosDisponibles: formData.horariosDisponibles,
        horasPorSemana: formData.horasPorSemana,
        compromisoTiempo: formData.compromisoTiempo,
        fechaInicioPreferida: formData.fechaInicioPreferida,
        restriccionesHorario: formData.restriccionesHorario,
        referencias: formData.referencias.filter(ref => ref.nombre.trim()),
        cvUrl: formData.cvUrl,
        cartaMotivacionUrl: formData.cartaMotivacionUrl,
        certificadosUrls: formData.certificadosUrls,
        comoSeEntero: formData.comoSeEntero,
        status: 'pendiente_revision' as const
      };

      // Add application
      const id = addApplication(applicationData);
      setApplicationId(id);

      // Send confirmation email
      sendConfirmationEmail(id);

      // Show success
      setSubmitted(true);
      toast.success('¡Solicitud enviada exitosamente!');

    } catch (error) {
      toast.error('Error al enviar la solicitud. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl mb-4">¡Solicitud Enviada!</h2>
          <p className="text-xl text-gray-600 mb-6">
            Tu solicitud de voluntariado ha sido recibida exitosamente
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="mb-2">
              <strong>ID de Solicitud:</strong> {applicationId}
            </p>
            <p className="text-sm text-gray-600">
              Guarda este número para futuras consultas
            </p>
          </div>

          <div className="text-left mb-8 space-y-3">
            <h3 className="text-xl mb-3">Próximos Pasos:</h3>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#4A9D5F] flex-shrink-0 mt-0.5" />
              <p>Recibirás un email de confirmación en {formData.email}</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#4A9D5F] flex-shrink-0 mt-0.5" />
              <p>Revisaremos tu solicitud en los próximos 5-7 días hábiles</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#4A9D5F] flex-shrink-0 mt-0.5" />
              <p>Te contactaremos por email o teléfono para coordinar una entrevista</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#4A9D5F] flex-shrink-0 mt-0.5" />
              <p>Si tienes preguntas, escríbenos a voluntariado@huahuacuna.org</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={onClose} variant="outline">
              Volver al Inicio
            </Button>
            <Button 
              className="bg-[#F4B223] hover:bg-[#E5A820] text-gray-900"
              onClick={() => window.print()}
            >
              Imprimir Confirmación
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = (currentStep / 5) * 100;
  const age = formData.fechaNacimiento ? calculateAge(formData.fechaNacimiento) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Heart className="w-8 h-8 text-[#F4B223]" />
                Inscripción de Voluntarios
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Completa el formulario y únete a nuestro equipo
              </p>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Paso {currentStep} de 5</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-6 text-sm">
            {['Personal', 'Voluntariado', 'Disponibilidad', 'Documentos', 'Términos'].map((label, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center ${
                  currentStep === index + 1 ? 'text-[#F4B223]' : 
                  currentStep > index + 1 ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep === index + 1 ? 'bg-[#F4B223] text-white' :
                  currentStep > index + 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>
                  {currentStep > index + 1 ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor corrige {Object.keys(errors).length} error(es) antes de continuar
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1 - Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl mb-4">Información Personal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                  <Input
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) => updateField('nombreCompleto', e.target.value)}
                    className={errors.nombreCompleto ? 'border-red-500' : ''}
                    placeholder="Ej: María González Pérez"
                  />
                  {errors.nombreCompleto && (
                    <p className="text-sm text-red-500 mt-1">{errors.nombreCompleto}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                  <Select value={formData.tipoDocumento} onValueChange={(v) => updateField('tipoDocumento', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cédula de Ciudadanía">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="Tarjeta de Identidad">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="Cédula de Extranjería">Cédula de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                  <Input
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => updateField('numeroDocumento', e.target.value)}
                    className={errors.numeroDocumento ? 'border-red-500' : ''}
                    placeholder="Ej: 1234567890"
                  />
                  {errors.numeroDocumento && (
                    <p className="text-sm text-red-500 mt-1">{errors.numeroDocumento}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => updateField('fechaNacimiento', e.target.value)}
                    className={errors.fechaNacimiento ? 'border-red-500' : ''}
                  />
                  {formData.fechaNacimiento && age > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {age} años
                      {age < 18 && ' - Necesitarás autorización de padres'}
                    </p>
                  )}
                  {errors.fechaNacimiento && (
                    <p className="text-sm text-red-500 mt-1">{errors.fechaNacimiento}</p>
                  )}
                </div>

                <div>
                  <Label>Género</Label>
                  <RadioGroup value={formData.genero} onValueChange={(v) => updateField('genero', v)}>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Masculino" id="masculino" />
                        <Label htmlFor="masculino" className="cursor-pointer">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Femenino" id="femenino" />
                        <Label htmlFor="femenino" className="cursor-pointer">Femenino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Otro" id="otro" />
                        <Label htmlFor="otro" className="cursor-pointer">Otro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Prefiero no decir" id="no-decir" />
                        <Label htmlFor="no-decir" className="cursor-pointer">Prefiero no decir</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                    className={errors.telefono ? 'border-red-500' : ''}
                    placeholder="+57 300 123 4567"
                  />
                  {errors.telefono && (
                    <p className="text-sm text-red-500 mt-1">{errors.telefono}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="sameWhatsApp"
                      checked={formData.sameWhatsApp}
                      onCheckedChange={(checked) => updateField('sameWhatsApp', checked)}
                    />
                    <Label htmlFor="sameWhatsApp" className="cursor-pointer">
                      Mi WhatsApp es el mismo número de teléfono
                    </Label>
                  </div>
                  {!formData.sameWhatsApp && (
                    <>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', e.target.value)}
                        placeholder="+57 300 123 4567"
                      />
                    </>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="direccion">Dirección de Residencia *</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => updateField('direccion', e.target.value)}
                    className={errors.direccion ? 'border-red-500' : ''}
                    placeholder="Calle, número, barrio"
                    rows={2}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-red-500 mt-1">{errors.direccion}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => updateField('ciudad', e.target.value)}
                    placeholder="Armenia"
                  />
                </div>

                <div>
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    value={formData.departamento}
                    onChange={(e) => updateField('departamento', e.target.value)}
                    placeholder="Quindío"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Volunteering Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl mb-4">Información de Voluntariado</h3>

              <div>
                <Label>Área(s) de Interés * (Máximo 3)</Label>
                <p className="text-sm text-gray-600 mb-3">Selecciona las áreas en las que te gustaría ayudar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {VOLUNTEER_AREAS.map(area => (
                    <div 
                      key={area}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.areasInteres.includes(area)
                          ? 'border-[#4A9D5F] bg-[#4A9D5F]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleArea(area)}
                    >
                      <Checkbox
                        checked={formData.areasInteres.includes(area)}
                        onCheckedChange={() => toggleArea(area)}
                      />
                      <Label className="cursor-pointer flex-1">{area}</Label>
                    </div>
                  ))}
                </div>
                {formData.areasInteres.includes('Otro') && (
                  <div className="mt-3">
                    <Label htmlFor="otraArea">Especifica otra área</Label>
                    <Input
                      id="otraArea"
                      value={formData.otraArea}
                      onChange={(e) => updateField('otraArea', e.target.value)}
                      placeholder="Describe el área en la que te gustaría ayudar"
                    />
                  </div>
                )}
                {errors.areasInteres && (
                  <p className="text-sm text-red-500 mt-1">{errors.areasInteres}</p>
                )}
              </div>

              <div>
                <Label htmlFor="habilidades">Habilidades y Experiencia *</Label>
                <Textarea
                  id="habilidades"
                  value={formData.habilidades}
                  onChange={(e) => updateField('habilidades', e.target.value)}
                  className={errors.habilidades ? 'border-red-500' : ''}
                  placeholder="Describe tus habilidades, formación y experiencia relevante..."
                  rows={5}
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  {errors.habilidades && (
                    <p className="text-sm text-red-500">{errors.habilidades}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">{formData.habilidades.length}/500</p>
                </div>
              </div>

              <div>
                <Label>¿Tienes experiencia previa como voluntario?</Label>
                <RadioGroup 
                  value={formData.tieneExperienciaPrevia} 
                  onValueChange={(v) => updateField('tieneExperienciaPrevia', v)}
                >
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="exp-si" />
                      <Label htmlFor="exp-si" className="cursor-pointer">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="exp-no" />
                      <Label htmlFor="exp-no" className="cursor-pointer">No</Label>
                    </div>
                  </div>
                </RadioGroup>
                {formData.tieneExperienciaPrevia === 'si' && (
                  <div className="mt-3">
                    <Label htmlFor="experienciaPrevia">Cuéntanos sobre tu experiencia</Label>
                    <Textarea
                      id="experienciaPrevia"
                      value={formData.experienciaPrevia}
                      onChange={(e) => updateField('experienciaPrevia', e.target.value)}
                      placeholder="Describe tu experiencia previa como voluntario..."
                      rows={3}
                      maxLength={300}
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.experienciaPrevia?.length || 0}/300</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="motivacion">Motivación *</Label>
                <p className="text-sm text-gray-600 mb-2">¿Por qué quieres ser voluntario en Fundación Huahuacuna?</p>
                <Textarea
                  id="motivacion"
                  value={formData.motivacion}
                  onChange={(e) => updateField('motivacion', e.target.value)}
                  className={errors.motivacion ? 'border-red-500' : ''}
                  placeholder="Comparte tu motivación para ser voluntario..."
                  rows={5}
                  maxLength={400}
                />
                <div className="flex justify-between mt-1">
                  {errors.motivacion && (
                    <p className="text-sm text-red-500">{errors.motivacion}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">{formData.motivacion.length}/400</p>
                </div>
              </div>

              <div>
                <Label htmlFor="queEsperaAportar">¿Qué esperas aportar?</Label>
                <Textarea
                  id="queEsperaAportar"
                  value={formData.queEsperaAportar}
                  onChange={(e) => updateField('queEsperaAportar', e.target.value)}
                  placeholder="¿Cómo crees que puedes contribuir a la fundación?"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.queEsperaAportar.length}/300</p>
              </div>
            </div>
          )}

          {/* Step 3 - Availability */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl mb-4">Disponibilidad</h3>

              <div>
                <Label>Días Disponibles *</Label>
                <p className="text-sm text-gray-600 mb-3">Selecciona los días en los que podrías asistir</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DIAS_SEMANA.map(dia => (
                    <div
                      key={dia}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.diasDisponibles.includes(dia)
                          ? 'border-[#4A9D5F] bg-[#4A9D5F]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleDia(dia)}
                    >
                      <Checkbox
                        checked={formData.diasDisponibles.includes(dia)}
                        onCheckedChange={() => toggleDia(dia)}
                      />
                      <Label className="cursor-pointer">{dia}</Label>
                    </div>
                  ))}
                </div>
                {errors.diasDisponibles && (
                  <p className="text-sm text-red-500 mt-1">{errors.diasDisponibles}</p>
                )}
              </div>

              <div>
                <Label>Horarios Disponibles *</Label>
                <p className="text-sm text-gray-600 mb-3">¿En qué horarios puedes asistir?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {HORARIOS.map(horario => (
                    <div
                      key={horario}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.horariosDisponibles.includes(horario)
                          ? 'border-[#4A9D5F] bg-[#4A9D5F]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleHorario(horario)}
                    >
                      <Checkbox
                        checked={formData.horariosDisponibles.includes(horario)}
                        onCheckedChange={() => toggleHorario(horario)}
                      />
                      <Label className="cursor-pointer">{horario}</Label>
                    </div>
                  ))}
                </div>
                {errors.horariosDisponibles && (
                  <p className="text-sm text-red-500 mt-1">{errors.horariosDisponibles}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="horasPorSemana">Horas por Semana *</Label>
                  <Input
                    id="horasPorSemana"
                    type="number"
                    min="4"
                    max="40"
                    value={formData.horasPorSemana}
                    onChange={(e) => updateField('horasPorSemana', parseInt(e.target.value) || 4)}
                    className={errors.horasPorSemana ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-gray-600 mt-1">Mínimo 4 horas semanales</p>
                  {errors.horasPorSemana && (
                    <p className="text-sm text-red-500 mt-1">{errors.horasPorSemana}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="compromisoTiempo">Compromiso de Tiempo *</Label>
                  <Select value={formData.compromisoTiempo} onValueChange={(v) => updateField('compromisoTiempo', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 meses">3 meses (Mínimo requerido)</SelectItem>
                      <SelectItem value="6 meses">6 meses</SelectItem>
                      <SelectItem value="1 año">1 año</SelectItem>
                      <SelectItem value="Más de 1 año">Más de 1 año</SelectItem>
                      <SelectItem value="Indefinido">Indefinido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fechaInicioPreferida">Fecha de Inicio Preferida</Label>
                  <Input
                    id="fechaInicioPreferida"
                    type="date"
                    value={formData.fechaInicioPreferida}
                    onChange={(e) => updateField('fechaInicioPreferida', e.target.value)}
                    min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="restriccionesHorario">Restricciones de Horario</Label>
                <Textarea
                  id="restriccionesHorario"
                  value={formData.restriccionesHorario}
                  onChange={(e) => updateField('restriccionesHorario', e.target.value)}
                  placeholder="Ej: No disponible durante julio por vacaciones"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.restriccionesHorario.length}/200</p>
              </div>
            </div>
          )}

          {/* Step 4 - References & Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl mb-4">Referencias y Documentos</h3>

              {/* References */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Referencias Personales * (Máximo 2)</Label>
                  {formData.referencias.length < 2 && (
                    <Button type="button" variant="outline" size="sm" onClick={addReferencia}>
                      Agregar Referencia
                    </Button>
                  )}
                </div>

                {formData.referencias.map((ref, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4>Referencia {index + 1}</h4>
                        {formData.referencias.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReferencia(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`ref-nombre-${index}`}>Nombre Completo *</Label>
                          <Input
                            id={`ref-nombre-${index}`}
                            value={ref.nombre}
                            onChange={(e) => updateReferencia(index, 'nombre', e.target.value)}
                            className={errors[`referencia${index + 1}Nombre`] ? 'border-red-500' : ''}
                          />
                          {errors[`referencia${index + 1}Nombre`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`referencia${index + 1}Nombre`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`ref-relacion-${index}`}>Relación *</Label>
                          <Select 
                            value={ref.relacion} 
                            onValueChange={(v) => updateReferencia(index, 'relacion', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Familiar">Familiar</SelectItem>
                              <SelectItem value="Amigo">Amigo</SelectItem>
                              <SelectItem value="Compañero de trabajo">Compañero de trabajo</SelectItem>
                              <SelectItem value="Profesor">Profesor</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`ref-telefono-${index}`}>Teléfono *</Label>
                          <Input
                            id={`ref-telefono-${index}`}
                            type="tel"
                            value={ref.telefono}
                            onChange={(e) => updateReferencia(index, 'telefono', e.target.value)}
                            className={errors[`referencia${index + 1}Telefono`] ? 'border-red-500' : ''}
                          />
                          {errors[`referencia${index + 1}Telefono`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`referencia${index + 1}Telefono`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`ref-email-${index}`}>Email (opcional)</Label>
                          <Input
                            id={`ref-email-${index}`}
                            type="email"
                            value={ref.email}
                            onChange={(e) => updateReferencia(index, 'email', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CV Upload */}
              <div>
                <Label htmlFor="cv">Hoja de Vida / CV * (PDF, máximo 2MB)</Label>
                {!formData.cvUrl ? (
                  <div className="mt-2">
                    <label 
                      htmlFor="cv-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        errors.cv ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click para subir o arrastra tu CV aquí
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Solo archivos PDF, máximo 2MB
                        </p>
                      </div>
                      <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'cv');
                        }}
                      />
                    </label>
                    {errors.cv && (
                      <p className="text-sm text-red-500 mt-1">{errors.cv}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg mt-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm">{formData.cvFile?.name}</p>
                        <p className="text-xs text-gray-600">
                          {formData.cvFile && (formData.cvFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateField('cvFile', null);
                        updateField('cvUrl', '');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Optional documents */}
              <div>
                <Label htmlFor="carta">Carta de Motivación (opcional)</Label>
                {!formData.cartaMotivacionUrl ? (
                  <div className="mt-2">
                    <label
                      htmlFor="carta-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-gray-400 bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <p className="text-sm text-gray-600">Subir carta de motivación</p>
                      </div>
                      <input
                        id="carta-upload"
                        type="file"
                        className="hidden"
                        accept="application/pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'carta');
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <p className="text-sm">{formData.cartaMotivacionFile?.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateField('cartaMotivacionFile', null);
                        updateField('cartaMotivacionUrl', '');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="comoSeEntero">¿Cómo te enteraste de nosotros?</Label>
                <Select value={formData.comoSeEntero} onValueChange={(v) => updateField('comoSeEntero', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sitio web">Sitio web</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Recomendación">Recomendación de amigo/familiar</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                    <SelectItem value="Google">Búsqueda en Google</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5 - Terms & Conditions */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-2xl mb-4">Términos y Condiciones</h3>

              <div className="space-y-4">
                <div className={`flex items-start space-x-3 p-4 border rounded-lg ${
                  errors.autorizaDatos ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}>
                  <Checkbox
                    id="autorizaDatos"
                    checked={formData.autorizaDatos}
                    onCheckedChange={(checked) => updateField('autorizaDatos', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="autorizaDatos" className="cursor-pointer flex-1">
                    Autorizo el tratamiento de mis datos personales según la{' '}
                    <a href="#" className="text-[#4A9D5F] hover:underline">
                      Política de Privacidad
                    </a>
                    {' '}*
                  </Label>
                </div>

                <div className={`flex items-start space-x-3 p-4 border rounded-lg ${
                  errors.compromisoVoluntariado ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}>
                  <Checkbox
                    id="compromisoVoluntariado"
                    checked={formData.compromisoVoluntariado}
                    onCheckedChange={(checked) => updateField('compromisoVoluntariado', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="compromisoVoluntariado" className="cursor-pointer flex-1">
                    Me comprometo a cumplir con el reglamento interno de voluntarios y a mantener 
                    confidencialidad sobre la información de los niños *
                  </Label>
                </div>

                <div className={`flex items-start space-x-3 p-4 border rounded-lg ${
                  errors.disponibleEntrevista ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}>
                  <Checkbox
                    id="disponibleEntrevista"
                    checked={formData.disponibleEntrevista}
                    onCheckedChange={(checked) => updateField('disponibleEntrevista', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="disponibleEntrevista" className="cursor-pointer flex-1">
                    Estoy disponible para una entrevista personal o virtual *
                  </Label>
                </div>

                <div className={`flex items-start space-x-3 p-4 border rounded-lg ${
                  errors.declaracionVeracidad ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}>
                  <Checkbox
                    id="declaracionVeracidad"
                    checked={formData.declaracionVeracidad}
                    onCheckedChange={(checked) => updateField('declaracionVeracidad', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="declaracionVeracidad" className="cursor-pointer flex-1">
                    Declaro que toda la información proporcionada es verídica *
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg border-gray-200">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => updateField('newsletter', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="newsletter" className="cursor-pointer flex-1">
                    Deseo recibir información sobre eventos y noticias de la fundación (opcional)
                  </Label>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Al enviar este formulario, tu solicitud será revisada por nuestro equipo. 
                  Te contactaremos en un plazo de 5-7 días hábiles.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
            
            {currentStep < 5 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="ml-auto bg-[#4A9D5F] hover:bg-[#3B7D4D]"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto bg-[#F4B223] hover:bg-[#E5A820] text-gray-900 text-lg px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

