import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Save, X, Eye, Plus, Trash2, GripVertical, Upload, 
  Check, AlertCircle, Calendar as CalendarIcon 
} from 'lucide-react';
import { useProjects, type Project, type ProjectStatus } from '../../contexts/ProjectsContext';
import { toast } from 'sonner';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface ProjectFormPageProps {
  projectId?: string;
  onClose: () => void;
  onSave?: () => void;
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
  'Entre semana',
  'Fines de semana',
  'Tiempo completo',
  'Medio tiempo',
  'Flexible'
];

const MUNICIPIOS = [
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
  'Génova',
  'Buenavista'
];

export const ProjectFormPage: React.FC<ProjectFormPageProps> = ({ 
  projectId, 
  onClose,
  onSave 
}) => {
  const { getProjectById, addProject, updateProject } = useProjects();
  const isEditing = !!projectId;
  const existingProject = projectId ? getProjectById(projectId) : null;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    mainGoal: '',
    specificObjectives: [''],
    beneficiariesCount: '',
    beneficiariesDescription: '',
    expectedImpact: '',
    startDate: '',
    endDate: '',
    status: 'borrador' as ProjectStatus,
    isPublished: false,
    mainImage: '',
    videoUrl: '',
    needsVolunteers: false,
    volunteersNeeded: '',
    requiredSkills: [] as string[],
    otherSkill: '',
    volunteerProfile: '',
    requiredAvailability: [] as string[],
    timeCommitment: '',
    estimatedHours: '',
    location: [] as string[],
    partners: '',
    budget: '',
    showBudget: false,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Load existing project data
  useEffect(() => {
    if (existingProject) {
      setFormData({
        title: existingProject.title,
        shortDescription: existingProject.shortDescription,
        fullDescription: existingProject.fullDescription,
        mainGoal: existingProject.mainGoal,
        specificObjectives: existingProject.specificObjectives.length > 0 
          ? existingProject.specificObjectives 
          : [''],
        beneficiariesCount: existingProject.beneficiaries.count.toString(),
        beneficiariesDescription: existingProject.beneficiaries.description,
        expectedImpact: existingProject.expectedImpact || '',
        startDate: existingProject.startDate,
        endDate: existingProject.endDate,
        status: existingProject.status,
        isPublished: existingProject.isPublished,
        mainImage: existingProject.mainImage,
        videoUrl: existingProject.videoUrl || '',
        needsVolunteers: existingProject.needsVolunteers,
        volunteersNeeded: existingProject.volunteersNeeded?.toString() || '',
        requiredSkills: existingProject.requiredSkills,
        otherSkill: '',
        volunteerProfile: existingProject.volunteerProfile || '',
        requiredAvailability: existingProject.requiredAvailability,
        timeCommitment: existingProject.timeCommitment || '',
        estimatedHours: existingProject.estimatedHours || '',
        location: existingProject.location,
        partners: existingProject.partners || '',
        budget: existingProject.budget?.toString() || '',
        showBudget: existingProject.showBudget || false,
        contactName: existingProject.contactPerson.name,
        contactEmail: existingProject.contactPerson.email,
        contactPhone: existingProject.contactPerson.phone,
        tags: existingProject.tags.join(', '),
      });
    }
  }, [existingProject]);

  // Track unsaved changes
  useEffect(() => {
    if (existingProject) {
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addObjective = () => {
    if (formData.specificObjectives.length < 10) {
      setFormData(prev => ({
        ...prev,
        specificObjectives: [...prev.specificObjectives, '']
      }));
    }
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.specificObjectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, specificObjectives: newObjectives }));
    setHasUnsavedChanges(true);
  };

  const removeObjective = (index: number) => {
    if (formData.specificObjectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        specificObjectives: prev.specificObjectives.filter((_, i) => i !== index)
      }));
      setHasUnsavedChanges(true);
    }
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = formData.requiredSkills;
    if (currentSkills.includes(skill)) {
      updateField('requiredSkills', currentSkills.filter(s => s !== skill));
    } else {
      updateField('requiredSkills', [...currentSkills, skill]);
    }
  };

  const toggleAvailability = (availability: string) => {
    const current = formData.requiredAvailability;
    if (current.includes(availability)) {
      updateField('requiredAvailability', current.filter(a => a !== availability));
    } else {
      updateField('requiredAvailability', [...current, availability]);
    }
  };

  const toggleLocation = (location: string) => {
    const current = formData.location;
    if (current.includes(location)) {
      updateField('location', current.filter(l => l !== location));
    } else {
      updateField('location', [...current, location]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'El título debe tener al menos 10 caracteres';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'La descripción corta es requerida';
    }

    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = 'La descripción completa es requerida';
    }

    if (!formData.mainGoal.trim()) {
      newErrors.mainGoal = 'El objetivo principal es requerido';
    }

    if (!formData.beneficiariesCount || parseInt(formData.beneficiariesCount) < 1) {
      newErrors.beneficiariesCount = 'El número de beneficiarios debe ser mayor a 0';
    }

    if (!formData.beneficiariesDescription.trim()) {
      newErrors.beneficiariesDescription = 'La descripción de beneficiarios es requerida';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.mainImage.trim()) {
      newErrors.mainImage = 'La imagen principal es requerida';
    }

    if (formData.needsVolunteers) {
      if (formData.requiredSkills.length === 0) {
        newErrors.requiredSkills = 'Selecciona al menos una habilidad requerida';
      }
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nombre de contacto es requerido';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'El email de contacto es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono de contacto es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (asDraft: boolean = true) => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSaving(true);

    try {
      // Add "Otro" skill if specified
      let finalSkills = [...formData.requiredSkills];
      if (formData.otherSkill.trim()) {
        finalSkills = finalSkills.filter(s => s !== 'Otro');
        finalSkills.push(formData.otherSkill.trim());
      }

      const projectData = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        mainGoal: formData.mainGoal.trim(),
        specificObjectives: formData.specificObjectives.filter(o => o.trim()),
        beneficiaries: {
          count: parseInt(formData.beneficiariesCount),
          description: formData.beneficiariesDescription.trim()
        },
        expectedImpact: formData.expectedImpact.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: asDraft ? formData.status : 'activo' as ProjectStatus,
        isPublished: !asDraft,
        mainImage: formData.mainImage.trim(),
        gallery: [],
        videoUrl: formData.videoUrl.trim(),
        needsVolunteers: formData.needsVolunteers,
        volunteersNeeded: formData.volunteersNeeded ? parseInt(formData.volunteersNeeded) : undefined,
        requiredSkills: finalSkills,
        volunteerProfile: formData.volunteerProfile.trim(),
        requiredAvailability: formData.requiredAvailability,
        timeCommitment: formData.timeCommitment,
        estimatedHours: formData.estimatedHours.trim(),
        location: formData.location,
        partners: formData.partners.trim(),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        showBudget: formData.showBudget,
        contactPerson: {
          name: formData.contactName.trim(),
          email: formData.contactEmail.trim(),
          phone: formData.contactPhone.trim()
        },
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        createdBy: 'admin'
      };

      if (isEditing && projectId) {
        updateProject(projectId, projectData);
        toast.success(asDraft ? 'Proyecto guardado como borrador' : 'Proyecto publicado exitosamente');
      } else {
        addProject(projectData);
        toast.success(asDraft ? 'Proyecto creado como borrador' : 'Proyecto creado y publicado');
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      // Wait a bit then close
      setTimeout(() => {
        onSave?.();
        onClose();
      }, 1000);

    } catch (error) {
      toast.error('Error al guardar el proyecto');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas salir sin guardar?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getDuration = () => {
    if (!formData.startDate || !formData.endDate) return '';
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} ${months === 1 ? 'mes' : 'meses'}` : `${days} días`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2">
              {isEditing ? `Editar Proyecto: ${existingProject?.title}` : 'Crear Nuevo Proyecto'}
            </h1>
            <div className="text-sm text-gray-600">
              {lastSaved && (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Guardado automáticamente a las {lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {!lastSaved && hasUnsavedChanges && (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  Sin guardar
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por favor corrige {Object.keys(errors).length} error(es) en el formulario
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Section 1 - Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Proyecto *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ej: Escuela de Música para Niños"
                  maxLength={100}
                  className={errors.title ? 'border-red-500' : ''}
                />
                <div className="flex justify-between mt-1">
                  {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                  <span className="text-sm text-gray-500 ml-auto">{formData.title.length}/100</span>
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Descripción Corta *</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  placeholder="Breve resumen del proyecto en una o dos frases"
                  maxLength={200}
                  rows={3}
                  className={errors.shortDescription ? 'border-red-500' : ''}
                />
                <div className="flex justify-between mt-1">
                  {errors.shortDescription && <span className="text-sm text-red-500">{errors.shortDescription}</span>}
                  <span className="text-sm text-gray-500 ml-auto">{formData.shortDescription.length}/200</span>
                </div>
              </div>

              <div>
                <Label htmlFor="fullDescription">Descripción Completa *</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => updateField('fullDescription', e.target.value)}
                  placeholder="Describe el proyecto en detalle..."
                  maxLength={5000}
                  rows={10}
                  className={errors.fullDescription ? 'border-red-500' : ''}
                />
                <div className="flex justify-between mt-1">
                  {errors.fullDescription && <span className="text-sm text-red-500">{errors.fullDescription}</span>}
                  <span className="text-sm text-gray-500 ml-auto">{formData.fullDescription.length}/5000</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Puedes usar HTML básico: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 - Objetivos y Alcance */}
          <Card>
            <CardHeader>
              <CardTitle>Objetivos y Alcance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mainGoal">Objetivo Principal *</Label>
                <Textarea
                  id="mainGoal"
                  value={formData.mainGoal}
                  onChange={(e) => updateField('mainGoal', e.target.value)}
                  placeholder="¿Qué se busca lograr con este proyecto?"
                  maxLength={500}
                  rows={3}
                  className={errors.mainGoal ? 'border-red-500' : ''}
                />
                <div className="flex justify-between mt-1">
                  {errors.mainGoal && <span className="text-sm text-red-500">{errors.mainGoal}</span>}
                  <span className="text-sm text-gray-500 ml-auto">{formData.mainGoal.length}/500</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Objetivos Específicos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addObjective}
                    disabled={formData.specificObjectives.length >= 10}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar objetivo
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.specificObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                      <Input
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder={`Objetivo ${index + 1}`}
                        maxLength={150}
                      />
                      {formData.specificObjectives.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeObjective(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="beneficiariesCount">Número de Beneficiarios *</Label>
                  <Input
                    id="beneficiariesCount"
                    type="number"
                    min="1"
                    value={formData.beneficiariesCount}
                    onChange={(e) => updateField('beneficiariesCount', e.target.value)}
                    className={errors.beneficiariesCount ? 'border-red-500' : ''}
                  />
                  {errors.beneficiariesCount && (
                    <span className="text-sm text-red-500">{errors.beneficiariesCount}</span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="beneficiariesDescription">Descripción de Beneficiarios *</Label>
                <Textarea
                  id="beneficiariesDescription"
                  value={formData.beneficiariesDescription}
                  onChange={(e) => updateField('beneficiariesDescription', e.target.value)}
                  placeholder="Ej: Niños entre 8 y 14 años del municipio de Armenia"
                  maxLength={300}
                  rows={2}
                  className={errors.beneficiariesDescription ? 'border-red-500' : ''}
                />
                <div className="flex justify-between mt-1">
                  {errors.beneficiariesDescription && (
                    <span className="text-sm text-red-500">{errors.beneficiariesDescription}</span>
                  )}
                  <span className="text-sm text-gray-500 ml-auto">{formData.beneficiariesDescription.length}/300</span>
                </div>
              </div>

              <div>
                <Label htmlFor="expectedImpact">Impacto Esperado</Label>
                <Textarea
                  id="expectedImpact"
                  value={formData.expectedImpact}
                  onChange={(e) => updateField('expectedImpact', e.target.value)}
                  placeholder="Describe el cambio o impacto que generará el proyecto"
                  maxLength={500}
                  rows={3}
                />
                <span className="text-sm text-gray-500 mt-1 block">{formData.expectedImpact.length}/500</span>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 - Fechas y Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas y Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Inicio *</Label>
                  <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left ${errors.startDate ? 'border-red-500' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate 
                          ? new Date(formData.startDate).toLocaleDateString('es-CO')
                          : 'Seleccionar fecha'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate ? new Date(formData.startDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateField('startDate', date.toISOString().split('T')[0]);
                            setShowStartDatePicker(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <span className="text-sm text-red-500">{errors.startDate}</span>}
                </div>

                <div>
                  <Label>Fecha de Fin *</Label>
                  <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left ${errors.endDate ? 'border-red-500' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate 
                          ? new Date(formData.endDate).toLocaleDateString('es-CO')
                          : 'Seleccionar fecha'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate ? new Date(formData.endDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateField('endDate', date.toISOString().split('T')[0]);
                            setShowEndDatePicker(false);
                          }
                        }}
                        disabled={(date) => {
                          if (!formData.startDate) return false;
                          return date <= new Date(formData.startDate);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <span className="text-sm text-red-500">{errors.endDate}</span>}
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm">
                    <strong>Duración calculada:</strong> {getDuration()}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="status">Estado del Proyecto *</Label>
                <Select value={formData.status} onValueChange={(value: ProjectStatus) => updateField('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="archivado">Archivado</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <ProjectStatusBadge status={formData.status} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => updateField('isPublished', checked)}
                />
                <Label htmlFor="isPublished">
                  Publicado (visible al público)
                </Label>
              </div>
              {formData.isPublished && (
                <Alert>
                  <AlertDescription>
                    Este proyecto será visible en el catálogo público
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Section 4 - Multimedia */}
          <Card>
            <CardHeader>
              <CardTitle>Multimedia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mainImage">Imagen Principal * (URL)</Label>
                <Input
                  id="mainImage"
                  type="url"
                  value={formData.mainImage}
                  onChange={(e) => updateField('mainImage', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className={errors.mainImage ? 'border-red-500' : ''}
                />
                {errors.mainImage && <span className="text-sm text-red-500">{errors.mainImage}</span>}
                <p className="text-sm text-gray-500 mt-1">
                  Recomendado: 1200x800px, formato JPG o PNG
                </p>
                {formData.mainImage && (
                  <div className="mt-3 border rounded p-2">
                    <img 
                      src={formData.mainImage} 
                      alt="Vista previa" 
                      className="max-w-md w-full h-48 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x800?text=Error+al+cargar+imagen';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="videoUrl">Video del Proyecto (URL de YouTube o Vimeo)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 5 - Requisitos para Voluntarios */}
          <Card>
            <CardHeader>
              <CardTitle>Requisitos para Voluntarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="needsVolunteers"
                  checked={formData.needsVolunteers}
                  onCheckedChange={(checked) => updateField('needsVolunteers', checked)}
                />
                <Label htmlFor="needsVolunteers">
                  ¿Necesita Voluntarios?
                </Label>
              </div>

              {formData.needsVolunteers && (
                <>
                  <div>
                    <Label htmlFor="volunteersNeeded">Número de Voluntarios Necesarios</Label>
                    <Input
                      id="volunteersNeeded"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.volunteersNeeded}
                      onChange={(e) => updateField('volunteersNeeded', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Habilidades Requeridas *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {SKILL_OPTIONS.map(skill => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={formData.requiredSkills.includes(skill)}
                            onCheckedChange={() => toggleSkill(skill)}
                          />
                          <Label htmlFor={`skill-${skill}`} className="cursor-pointer">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.requiredSkills.includes('Otro') && (
                      <Input
                        value={formData.otherSkill}
                        onChange={(e) => updateField('otherSkill', e.target.value)}
                        placeholder="Especifica la habilidad"
                        className="mt-2"
                      />
                    )}
                    {errors.requiredSkills && (
                      <span className="text-sm text-red-500 block mt-1">{errors.requiredSkills}</span>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="volunteerProfile">Perfil del Voluntario Ideal</Label>
                    <Textarea
                      id="volunteerProfile"
                      value={formData.volunteerProfile}
                      onChange={(e) => updateField('volunteerProfile', e.target.value)}
                      placeholder="Describe el tipo de voluntario que buscas"
                      maxLength={300}
                      rows={3}
                    />
                    <span className="text-sm text-gray-500 mt-1 block">{formData.volunteerProfile.length}/300</span>
                  </div>

                  <div>
                    <Label>Disponibilidad Requerida</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {AVAILABILITY_OPTIONS.map(availability => (
                        <div key={availability} className="flex items-center space-x-2">
                          <Checkbox
                            id={`availability-${availability}`}
                            checked={formData.requiredAvailability.includes(availability)}
                            onCheckedChange={() => toggleAvailability(availability)}
                          />
                          <Label htmlFor={`availability-${availability}`} className="cursor-pointer">
                            {availability}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeCommitment">Compromiso de Tiempo</Label>
                      <Select value={formData.timeCommitment} onValueChange={(value) => updateField('timeCommitment', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Una vez">Una vez</SelectItem>
                          <SelectItem value="Semanal">Semanal</SelectItem>
                          <SelectItem value="Quincenal">Quincenal</SelectItem>
                          <SelectItem value="Mensual">Mensual</SelectItem>
                          <SelectItem value="Varios meses">Varios meses</SelectItem>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estimatedHours">Horas Estimadas</Label>
                      <Input
                        id="estimatedHours"
                        value={formData.estimatedHours}
                        onChange={(e) => updateField('estimatedHours', e.target.value)}
                        placeholder="Ej: 4-6 horas por semana"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 6 - Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ubicación del Proyecto</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {MUNICIPIOS.map(municipio => (
                    <div key={municipio} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${municipio}`}
                        checked={formData.location.includes(municipio)}
                        onCheckedChange={() => toggleLocation(municipio)}
                      />
                      <Label htmlFor={`location-${municipio}`} className="cursor-pointer">
                        {municipio}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="partners">Socios o Aliados</Label>
                <Textarea
                  id="partners"
                  value={formData.partners}
                  onChange={(e) => updateField('partners', e.target.value)}
                  placeholder="Organizaciones o entidades colaboradoras"
                  maxLength={300}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="budget">Presupuesto Estimado (COP)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                  placeholder="0"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="showBudget"
                    checked={formData.showBudget}
                    onCheckedChange={(checked) => updateField('showBudget', checked)}
                  />
                  <Label htmlFor="showBudget">Mostrar públicamente</Label>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3">Persona de Contacto</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="contactName">Nombre *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => updateField('contactName', e.target.value)}
                      className={errors.contactName ? 'border-red-500' : ''}
                    />
                    {errors.contactName && <span className="text-sm text-red-500">{errors.contactName}</span>}
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                      className={errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {errors.contactEmail && <span className="text-sm text-red-500">{errors.contactEmail}</span>}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Teléfono *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                      placeholder="+57 300 123 4567"
                      className={errors.contactPhone ? 'border-red-500' : ''}
                    />
                    {errors.contactPhone && <span className="text-sm text-red-500">{errors.contactPhone}</span>}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags / Etiquetas</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  placeholder="educación, música, deporte (separados por comas)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Máximo 5 tags. Sugerencias: educación, música, deporte, arte, salud, sostenibilidad
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t p-4 mt-6 -mx-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => handleSave(true)} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar como Borrador
              </>
            )}
          </Button>

          <Button 
            onClick={() => handleSave(false)} 
            disabled={isSaving}
            className="bg-[#F4B223] hover:bg-[#E5A820] text-gray-900"
          >
            {isSaving ? (
              <>Publicando...</>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Publicar Proyecto
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};
