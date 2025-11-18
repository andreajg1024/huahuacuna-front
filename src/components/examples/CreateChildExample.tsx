/**
 * Ejemplo de uso del servicio de Apadrinamiento
 * 
 * Este componente demuestra cómo usar la integración con el backend
 * para crear niños mediante el endpoint Kafka.
 */

import { useState } from 'react';
import { useBitacora } from '@/contexts/BitacoraContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function CreateChildExample() {
  const { addChild } = useBitacora();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const fechaNacimiento = formData.get('fechaNacimiento') as string;
      const birthDate = new Date(fechaNacimiento);
      const today = new Date();
      let edad = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        edad--;
      }

      const newChild = await addChild({
        nombre: formData.get('nombre') as string,
        apellidos: formData.get('apellidos') as string,
        fechaNacimiento,
        edad,
        genero: formData.get('genero') as 'masculino' | 'femenino',
        municipio: formData.get('municipio') as string,
        direccion: formData.get('direccion') as string || '',
        institucion: formData.get('institucion') as string,
        grado: formData.get('grado') as string,
        foto: (formData.get('foto') as string) || 'https://via.placeholder.com/400',
        historia: formData.get('historia') as string,
        suenos: formData.get('suenos') as string,
        situacionFamiliar: formData.get('situacionFamiliar') as string || '',
        necesidades: ['Material escolar', 'Apoyo educativo'],
        estadoApadrinamiento: 'disponible',
        jornada: 'mañana',
      });

      console.log('Niño creado:', newChild);
      toast.success('Niño registrado exitosamente');
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el niño');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Registrar Nuevo Niño</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" name="nombre" required minLength={2} maxLength={50} placeholder="Ej: Juan" />
        </div>

        <div>
          <Label htmlFor="apellidos">Apellidos *</Label>
          <Input id="apellidos" name="apellidos" required minLength={2} maxLength={50} placeholder="Ej: Pérez López" />
        </div>

        <div>
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
          <Input id="fechaNacimiento" name="fechaNacimiento" type="date" required max={new Date().toISOString().split('T')[0]} />
        </div>

        <div>
          <Label htmlFor="genero">Género *</Label>
          <select id="genero" name="genero" required className="w-full border rounded p-2">
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div>
          <Label htmlFor="municipio">Municipio *</Label>
          <Input id="municipio" name="municipio" required minLength={2} maxLength={100} placeholder="Ej: Armenia" />
        </div>

        <div>
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" name="direccion" maxLength={200} placeholder="Ej: Calle 10 #5-23" />
        </div>

        <div>
          <Label htmlFor="institucion">Institución Educativa *</Label>
          <Input id="institucion" name="institucion" required placeholder="Ej: Colegio José Holguín" />
        </div>

        <div>
          <Label htmlFor="grado">Grado *</Label>
          <Input id="grado" name="grado" required placeholder="Ej: 4° Primaria" />
        </div>

        <div>
          <Label htmlFor="foto">URL de la Foto</Label>
          <Input id="foto" name="foto" type="url" placeholder="https://example.com/photo.jpg" />
        </div>

        <div>
          <Label htmlFor="historia">Historia *</Label>
          <Textarea id="historia" name="historia" required rows={4} placeholder="Cuéntanos la historia del niño..." />
        </div>

        <div>
          <Label htmlFor="suenos">Sueños y Aspiraciones *</Label>
          <Textarea id="suenos" name="suenos" required maxLength={200} rows={3} placeholder="¿Qué sueña ser o hacer?" />
        </div>

        <div>
          <Label htmlFor="situacionFamiliar">Situación Familiar</Label>
          <Textarea id="situacionFamiliar" name="situacionFamiliar" rows={3} placeholder="Describe la situación familiar..." />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Registrando...' : 'Registrar Niño'}
        </Button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <p className="text-sm text-blue-700">
          Este formulario envía los datos al backend mediante el endpoint Kafka{' '}
          <code className="bg-blue-100 px-1 rounded">apadrinamiento_children_create</code>.
          Los datos son validados automáticamente antes de enviarse.
        </p>
      </div>
    </div>
  );
}
