/**
 * Ejemplo de Uso de Hooks
 * 
 * Este componente demuestra cómo usar los hooks personalizados
 * en lugar de llamar directamente a los servicios
 */

import { useState, useEffect } from 'react';
import { useChildren, useBitacoraEntries, useSponsorship } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HookUsageExample() {
  // ============================================================================
  // EJEMPLO 1: Hook de Children
  // ============================================================================
  const {
    loading: loadingChildren,
    error: errorChildren,
    createChild,
    listChildren,
    updateChild,
    deleteChild,
  } = useChildren();

  const [children, setChildren] = useState<any[]>([]);

  // Cargar niños al montar
  useEffect(() => {
    const loadData = async () => {
      const result = await listChildren();
      if (result.success) {
        setChildren(result.data);
      }
    };
    loadData();
  }, []);

  // Crear niño
  const handleCreateChild = async () => {
    const result = await createChild({
      nombre: 'Juan',
      apellidos: 'Pérez',
      fechaNacimiento: '2015-05-20',
      edad: 9,
      genero: 'masculino',
      municipio: 'Armenia',
      direccion: 'Calle 10',
      institucion: 'Colegio X',
      grado: '4°',
      foto: 'https://...',
      historia: 'Historia...',
      suenos: 'Sueños...',
      situacionFamiliar: 'Situación...',
      necesidades: ['Material escolar'],
      estadoApadrinamiento: 'disponible',
      jornada: 'mañana',
    });

    if (result.success) {
      setChildren([...children, result.data]);
    }
  };

  // ============================================================================
  // EJEMPLO 2: Hook de Bitácora
  // ============================================================================
  const {
    loading: loadingBitacora,
    error: errorBitacora,
    createEntry,
    listEntries,
    updateEntry,
    deleteEntry,
  } = useBitacoraEntries();

  const [entries, setEntries] = useState<any[]>([]);

  // Crear entrada
  const handleCreateEntry = async (childId: string) => {
    const result = await createEntry({
      childId,
      tipo: 'foto',
      url: 'https://example.com/photo.jpg',
      descripcion: 'Descripción de la foto',
      fechaActividad: new Date().toISOString(),
      categoria: 'Educación',
      etiquetas: ['escuela', 'estudio'],
      visibilidad: 'publico',
      tamano: 1024000,
    });

    if (result.success) {
      setEntries([...entries, result.data]);
    }
  };

  // ============================================================================
  // EJEMPLO 3: Hook de Sponsorship
  // ============================================================================
  const {
    loading: loadingSponsorship,
    error: errorSponsorship,
    createSponsorship,
    sendMessage,
    listMessages,
  } = useSponsorship();

  const [messages, setMessages] = useState<any[]>([]);

  // Apadrinar niño
  const handleSponsor = async (childId: number) => {
    const result = await createSponsorship(childId);
    if (result.success) {
      console.log('Apadrinamiento creado:', result.data);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (sponsorshipId: number) => {
    const result = await sendMessage(sponsorshipId, 'Hola, ¿cómo está el niño?');
    if (result.success) {
      setMessages([...messages, result.data]);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Ejemplo de Uso de Hooks</h1>

      {/* Sección de Children */}
      <section className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">🧒 Children Hook</h2>
        
        <div className="space-y-2">
          <Button onClick={handleCreateChild} disabled={loadingChildren}>
            {loadingChildren ? 'Creando...' : 'Crear Niño'}
          </Button>

          {errorChildren && (
            <p className="text-red-500">Error: {errorChildren}</p>
          )}

          <div className="mt-4">
            <h3 className="font-semibold">Niños ({children.length}):</h3>
            <ul className="list-disc pl-5">
              {children.map((child) => (
                <li key={child.id}>
                  {child.nombre} {child.apellidos} - {child.edad} años
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteChild(child.id)}
                    className="ml-2"
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Sección de Bitácora */}
      <section className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">📸 Bitácora Hook</h2>
        
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="ID del niño"
            id="childIdInput"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('childIdInput') as HTMLInputElement;
              handleCreateEntry(input.value);
            }}
            disabled={loadingBitacora}
          >
            {loadingBitacora ? 'Creando...' : 'Agregar Foto'}
          </Button>

          {errorBitacora && (
            <p className="text-red-500">Error: {errorBitacora}</p>
          )}
        </div>
      </section>

      {/* Sección de Sponsorship */}
      <section className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">❤️ Sponsorship Hook</h2>
        
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="ID del niño a apadrinar"
            id="childToSponsorInput"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('childToSponsorInput') as HTMLInputElement;
              handleSponsor(parseInt(input.value));
            }}
            disabled={loadingSponsorship}
          >
            {loadingSponsorship ? 'Apadrinando...' : 'Apadrinar Niño'}
          </Button>

          {errorSponsorship && (
            <p className="text-red-500">Error: {errorSponsorship}</p>
          )}
        </div>
      </section>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Ventajas de usar Hooks</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Loading y error states automáticos</li>
          <li>✅ Toast notifications integradas</li>
          <li>✅ Código más limpio y reutilizable</li>
          <li>✅ Fácil de testear</li>
          <li>✅ Separación de responsabilidades</li>
        </ul>
      </div>
    </div>
  );
}
