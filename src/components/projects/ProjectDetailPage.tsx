import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft, Calendar, MapPin, Users, Clock, Share2, 
  Mail, Phone, Target, Heart, CheckCircle2, Facebook,
  Link as LinkIcon, Tag
} from 'lucide-react';
import type { Project } from '../../contexts/ProjectsContext';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

interface ProjectDetailPageProps {
  project: Project;
  onClose: () => void;
  onVolunteer: (project: Project) => void;
}

export function ProjectDetailPage({
  project,
  onClose,
  onVolunteer,
}: ProjectDetailPageProps) {
  const [showAllImages, setShowAllImages] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDuration = () => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} ${months === 1 ? 'mes' : 'meses'}` : `${days} días`;
  };

  const volunteersProgress = project.volunteersNeeded 
    ? (project.volunteersRegistered / project.volunteersNeeded) * 100 
    : 0;

  const handleShare = (platform: 'facebook' | 'whatsapp' | 'copy') => {
    const url = window.location.href;
    const text = `${project.title} - Fundación Huahuacuna`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div
        className="relative h-96 bg-gray-900"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${project.mainImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-white/90 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <ProjectStatusBadge status={project.status} className="bg-white/90" />
          </div>

          <div className="text-white">
            <h1 className="text-4xl md:text-5xl mb-4">{project.title}</h1>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm bg-white/20 backdrop-blur px-3 py-1 rounded">
                Publicado el {formatDate(project.createdAt)}
              </span>
              {project.volunteersRegistered > 0 && (
                <span className="text-sm bg-white/20 backdrop-blur px-3 py-1 rounded flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {project.volunteersRegistered} persona{project.volunteersRegistered !== 1 ? 's' : ''} ya se ha{project.volunteersRegistered !== 1 ? 'n' : ''} unido
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Inicio {'>'} Proyectos {'>'} {project.title}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleShare('facebook')}>
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare('whatsapp')}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare('copy')}>
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {project.shortDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descripción del Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="mb-2 text-blue-900">Objetivo Principal</h4>
                  <p className="text-gray-700">{project.mainGoal}</p>
                </div>

                {project.specificObjectives.length > 0 && (
                  <div>
                    <h4 className="mb-3">Objetivos Específicos</h4>
                    <ol className="space-y-2">
                      {project.specificObjectives.map((objective, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4A9D5F] text-white flex items-center justify-center text-sm">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ¿A quién beneficia?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#F4B223] flex items-center justify-center">
                    <span className="text-3xl text-gray-900">{project.beneficiaries.count}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Beneficiarios</p>
                    <p className="text-gray-700">{project.beneficiaries.description}</p>
                  </div>
                </div>

                {project.expectedImpact && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-2">Impacto Esperado</h4>
                      <p className="text-gray-700">{project.expectedImpact}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {project.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galería</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery.slice(0, showAllImages ? undefined : 6).map((image, index) => (
                      <div key={index} className="relative aspect-video">
                        <ImageWithFallback
                          src={image.url}
                          alt={image.caption || `Imagen ${index + 1}`}
                          className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => toast.info('Lightbox - en desarrollo')}
                        />
                        {image.caption && (
                          <p className="text-xs text-gray-600 mt-1">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {project.gallery.length > 6 && !showAllImages && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setShowAllImages(true)}
                    >
                      Ver todas las imágenes ({project.gallery.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {project.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Video del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Video embed - {project.videoUrl}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {project.partners && (
              <Card>
                <CardHeader>
                  <CardTitle>Trabajan con Nosotros</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{project.partners}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Info Card (comentario corregido) */}
            <Card>
              <CardHeader>
                <CardTitle>Información Rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Inicio</p>
                    <p>{formatDate(project.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Fin</p>
                    <p>{formatDate(project.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p>{getDuration()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p>{project.location.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Beneficiarios</p>
                    <p>{project.beneficiaries.count} personas</p>
                  </div>
                </div>

                {project.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">Categorías</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {project.needsVolunteers ? (
              <Card className="border-[#F4B223] border-2">
                <CardHeader className="bg-gradient-to-br from-[#F4B223]/10 to-[#F4B223]/5">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#F4B223]" />
                    ¿Quieres Ayudar?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-gray-700">
                    Necesitamos personas como tú para hacer realidad este proyecto
                  </p>

                  {project.volunteersNeeded && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Voluntarios Registrados</span>
                        <span>{project.volunteersRegistered} / {project.volunteersNeeded}</span>
                      </div>
                      <Progress value={volunteersProgress} className="h-2" />
                    </div>
                  )}

                  {project.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Habilidades requeridas:</p>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map(skill => (
                          <Badge key={skill} variant="secondary">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.requiredAvailability.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Disponibilidad:</p>
                      <p className="text-sm">{project.requiredAvailability.join(', ')}</p>
                    </div>
                  )}

                  {project.timeCommitment && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Compromiso:</p>
                      <p className="text-sm">{project.timeCommitment}</p>
                      {project.estimatedHours && (
                        <p className="text-sm text-gray-500">{project.estimatedHours}</p>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full bg-[#F4B223] hover:bg-[#E5A820] text-gray-900"
                    size="lg"
                    onClick={() => onVolunteer(project)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Registrarme como Voluntario
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Otras Formas de Ayudar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Apadrinar un Niño
                  </Button>
                  <Button className="w-full" variant="outline">
                    Hacer una Donación
                  </Button>
                  <Button className="w-full" variant="outline" onClick={onClose}>
                    Ver Otros Proyectos
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Más Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Persona de contacto</p>
                  <p>{project.contactPerson.name}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  {project.contactPerson.email}
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {project.contactPerson.phone}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
