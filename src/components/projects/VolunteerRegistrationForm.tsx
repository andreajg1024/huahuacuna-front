import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  X, Heart, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight 
} from 'lucide-react';
import type { Project } from '../../contexts/ProjectsContext';
import { useProjects } from '../../contexts/ProjectsContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface VolunteerRegistrationFormProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

const SKILL_OPTIONS = [
  'Enseñanza/Educación',
  'Música/Arte',
  'Deportes',
  'Salud/Medicina',
  'Cocina',
  'Carpintería',
  'Tecnología/Computación',
  'Administración',
  'Otro'
];

const AVAILABILITY_OPTIONS = [
  { value: 'weekday', label: 'Entre semana (Lunes - Viernes)' },
  { value: 'weekend', label: 'Fines de semana (Sábado - Domingo)' },
  { value: 'morning', label: 'Mañanas (6am - 12pm)' },
  { value: 'afternoon', label: 'Tardes (12pm - 6pm)' },
  { value: 'evening', label: 'Noches (6pm - 10pm)' }
];

export const VolunteerRegistrationForm: React.FC<VolunteerRegistrationFormProps> = ({
  project,
  onClose,
  onSuccess
}) => {
  const { registerVolunteer } = useProjects();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    documentId: '',
    birthDate: '',
    city: 'Armenia, Quindío',
    skills: [] as string[],
    otherSkill: '',
    previousExperience: '',
    motivation: '',
    availability: [] as string[],
    timeCommitment: '',
    hoursPerWeek: '',
    preferredStartDate: '',
    howDidYouHear: '',
    additionalComments: '',
    acceptedTerms: false,
    newsletterOptIn: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

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

  const toggleSkill = (skill: string) => {
    const current = formData.skills;
    if (current.includes(skill)) {
      updateField('skills', current.filter(s => s !== skill));
    } else {
      updateField('skills', [...current, skill]);
    }
  };

  const toggleAvailability = (availability: string) => {
    const current = formData.availability;
    if (current.includes(availability)) {
      updateField('availability', current.filter(a => a !== availability));
    } else {
      updateField('availability', [...current, availability]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
        newErrors.fullName = 'El nombre completo es requerido (mínimo 3 caracteres)';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'El teléfono es requerido';
      }

      if (formData.birthDate) {
        const age = Math.floor((new Date().getTime() - new Date(formData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        if (age < 18) {
          newErrors.birthDate = 'Debes ser mayor de 18 años';
        }
      }
    }

    if (step === 2) {
      if (formData.skills.length === 0) {
        newErrors.skills = 'Selecciona al menos una habilidad';
      }

      if (!formData.motivation.trim()) {
        newErrors.motivation = 'La motivación es requerida';
      } else if (formData.motivation.trim().length < 20) {
        newErrors.motivation = 'La motivación debe tener al menos 20 caracteres';
      }
    }

    if (step === 3) {
      if (formData.availability.length === 0) {
        newErrors.availability = 'Selecciona al menos una opción de disponibilidad';
      }

      if (!formData.timeCommitment) {
        newErrors.timeCommitment = 'Selecciona tu compromiso de tiempo';
      }
    }

    if (step === 4) {
      if (!formData.acceptedTerms) {
        newErrors.acceptedTerms = 'Debes aceptar los términos y condiciones';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process skills
      let finalSkills = [...formData.skills];
      if (formData.otherSkill.trim()) {
        finalSkills = finalSkills.filter(s => s !== 'Otro');
        finalSkills.push(formData.otherSkill.trim());
      }

      // Map availability labels
      const availabilityLabels = formData.availability.map(val => {
        const option = AVAILABILITY_OPTIONS.find(o => o.value === val);
        return option ? option.label : val;
      });

      // Calculate age if birthdate provided
      let age: number | undefined;
      if (formData.birthDate) {
        age = Math.floor((new Date().getTime() - new Date(formData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      }

      registerVolunteer({
        projectId: project.id,
        projectTitle: project.title,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        documentId: formData.documentId.trim(),
        birthDate: formData.birthDate,
        age,
        city: formData.city.trim(),
        skills: finalSkills,
        previousExperience: formData.previousExperience.trim(),
        motivation: formData.motivation.trim(),
        availability: availabilityLabels,
        timeCommitment: formData.timeCommitment,
        hoursPerWeek: formData.hoursPerWeek ? parseInt(formData.hoursPerWeek) : undefined,
        preferredStartDate: formData.preferredStartDate,
        howDidYouHear: formData.howDidYouHear,
        additionalComments: formData.additionalComments.trim(),
        acceptedTerms: formData.acceptedTerms,
        newsletterOptIn: formData.newsletterOptIn
      });

      // Show success modal
      toast.success('¡Solicitud enviada exitosamente!');

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      toast.error('Error al enviar la solicitud. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onClose} className="mb-4">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>

          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F4B223]/10 to-[#F4B223]/5">
              <ImageWithFallback
                src={project.mainImage}
                alt={project.title}
                className="w-20 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl mb-1">Regístrate como Voluntario</h2>
                <p className="text-sm text-gray-600">Para el proyecto: {project.title}</p>
              </div>
              <Heart className="w-8 h-8 text-[#F4B223]" />
            </div>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStep} de {totalSteps}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Información Personal'}
              {currentStep === 2 && 'Experiencia y Habilidades'}
              {currentStep === 3 && 'Disponibilidad'}
              {currentStep === 4 && 'Confirmación'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1 - Personal Info */}
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Juan Pérez García"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="juan@ejemplo.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+57 300 123 4567"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="documentId">Documento de Identidad</Label>
                    <Input
                      id="documentId"
                      value={formData.documentId}
                      onChange={(e) => updateField('documentId', e.target.value)}
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <Label>Fecha de Nacimiento</Label>
                    <Popover open={showBirthDatePicker} onOpenChange={setShowBirthDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left ${errors.birthDate ? 'border-red-500' : ''}`}
                        >
                          {formData.birthDate 
                            ? new Date(formData.birthDate).toLocaleDateString('es-CO')
                            : 'Seleccionar fecha'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              updateField('birthDate', date.toISOString().split('T')[0]);
                              setShowBirthDatePicker(false);
                            }
                          }}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.birthDate && <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">Ciudad de Residencia</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2 - Experience & Skills */}
            {currentStep === 2 && (
              <>
                <div>
                  <Label>Habilidades *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {SKILL_OPTIONS.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <Label htmlFor={`skill-${skill}`} className="cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.skills.includes('Otro') && (
                    <Input
                      value={formData.otherSkill}
                      onChange={(e) => updateField('otherSkill', e.target.value)}
                      placeholder="Especifica la habilidad"
                      className="mt-2"
                    />
                  )}
                  {errors.skills && <p className="text-sm text-red-500 mt-1">{errors.skills}</p>}
                  
                  {project.requiredSkills.length > 0 && (
                    <Alert className="mt-3">
                      <AlertDescription>
                        <strong>Habilidades requeridas para este proyecto:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.requiredSkills.map(skill => (
                            <span key={skill} className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <Label htmlFor="previousExperience">Experiencia Previa</Label>
                  <Textarea
                    id="previousExperience"
                    value={formData.previousExperience}
                    onChange={(e) => updateField('previousExperience', e.target.value)}
                    placeholder="¿Has trabajado como voluntario antes? Cuéntanos..."
                    maxLength={500}
                    rows={4}
                  />
                  <span className="text-sm text-gray-500">{formData.previousExperience.length}/500</span>
                </div>

                <div>
                  <Label htmlFor="motivation">Motivación *</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => updateField('motivation', e.target.value)}
                    placeholder="¿Por qué quieres ser voluntario en este proyecto?"
                    maxLength={300}
                    rows={4}
                    className={errors.motivation ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.motivation && <span className="text-sm text-red-500">{errors.motivation}</span>}
                    <span className="text-sm text-gray-500 ml-auto">{formData.motivation.length}/300</span>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 - Availability */}
            {currentStep === 3 && (
              <>
                <div>
                  <Label>¿Cuándo puedes colaborar? *</Label>
                  <div className="space-y-2 mt-2">
                    {AVAILABILITY_OPTIONS.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`availability-${option.value}`}
                          checked={formData.availability.includes(option.value)}
                          onCheckedChange={() => toggleAvailability(option.value)}
                        />
                        <Label htmlFor={`availability-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.availability && <p className="text-sm text-red-500 mt-1">{errors.availability}</p>}
                </div>

                <div>
                  <Label htmlFor="timeCommitment">Compromiso de Tiempo *</Label>
                  <Select value={formData.timeCommitment} onValueChange={(value) => updateField('timeCommitment', value)}>
                    <SelectTrigger className={errors.timeCommitment ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Una vez">Una vez</SelectItem>
                      <SelectItem value="Algunas veces al mes">Algunas veces al mes</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quincenal">Quincenal</SelectItem>
                      <SelectItem value="Mensual">Mensual</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.timeCommitment && <p className="text-sm text-red-500 mt-1">{errors.timeCommitment}</p>}
                </div>

                <div>
                  <Label htmlFor="hoursPerWeek">Horas Disponibles por Semana</Label>
                  <Input
                    id="hoursPerWeek"
                    type="number"
                    min="1"
                    max="40"
                    value={formData.hoursPerWeek}
                    onChange={(e) => updateField('hoursPerWeek', e.target.value)}
                    placeholder="Ej: 5"
                  />
                </div>

                <div>
                  <Label>Fecha de Inicio Preferida</Label>
                  <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {formData.preferredStartDate 
                          ? new Date(formData.preferredStartDate).toLocaleDateString('es-CO')
                          : 'Seleccionar fecha'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.preferredStartDate ? new Date(formData.preferredStartDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateField('preferredStartDate', date.toISOString().split('T')[0]);
                            setShowStartDatePicker(false);
                          }
                        }}
                        disabled={(date) => {
                          if (project.startDate) {
                            return date < new Date(project.startDate);
                          }
                          return date < new Date();
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Step 4 - Confirmation */}
            {currentStep === 4 && (
              <>
                <div>
                  <Label htmlFor="howDidYouHear">¿Cómo te enteraste de este proyecto?</Label>
                  <Select value={formData.howDidYouHear} onValueChange={(value) => updateField('howDidYouHear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sitio web">Sitio web</SelectItem>
                      <SelectItem value="Redes sociales">Redes sociales</SelectItem>
                      <SelectItem value="Recomendación">Recomendación</SelectItem>
                      <SelectItem value="Evento">Evento</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="additionalComments">Comentarios Adicionales</Label>
                  <Textarea
                    id="additionalComments"
                    value={formData.additionalComments}
                    onChange={(e) => updateField('additionalComments', e.target.value)}
                    placeholder="¿Algo más que quieras contarnos?"
                    maxLength={300}
                    rows={3}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptedTerms"
                      checked={formData.acceptedTerms}
                      onCheckedChange={(checked) => updateField('acceptedTerms', checked)}
                      className={errors.acceptedTerms ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="acceptedTerms" className="cursor-pointer leading-tight">
                      Acepto los términos y condiciones del voluntariado *
                      <a href="#" className="text-blue-600 ml-1">Leer términos</a>
                    </Label>
                  </div>
                  {errors.acceptedTerms && <p className="text-sm text-red-500">{errors.acceptedTerms}</p>}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="newsletterOptIn"
                      checked={formData.newsletterOptIn}
                      onCheckedChange={(checked) => updateField('newsletterOptIn', checked)}
                    />
                    <Label htmlFor="newsletterOptIn" className="cursor-pointer leading-tight">
                      Deseo recibir información de la fundación
                    </Label>
                  </div>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Al enviar este formulario, recibirás un correo de confirmación con los detalles de tu solicitud y los próximos pasos.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-[#F4B223] hover:bg-[#E5A820] text-gray-900"
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

