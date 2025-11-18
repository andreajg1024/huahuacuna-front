/**
 * Script de prueba para el endpoint de Crear Niño
 * 
 * Uso:
 *   node test-api.js
 * 
 * Configura BACKEND_URL y TOKEN antes de ejecutar
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const TOKEN = process.env.TOKEN || 'tu-token-aqui';

const testData = {
  dto: {
    firstName: 'Juan',
    lastName: 'Pérez López',
    dateOfBirth: '2015-05-20',
    gender: 'MALE',
    municipality: 'Armenia',
    shortDescription: 'Niño alegre que sueña con ser ingeniero',
    fullStory: 'Juan es un niño de 9 años que vive con su abuela en Armenia. Le apasionan las matemáticas y sueña con construir casas para familias necesitadas.',
    address: 'Calle 10 #5-23, Barrio La Fachada',
    photo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400',
    photos: [
      'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=600',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600'
    ]
  },
  userId: 1
};

async function testCreateChild() {
  console.log('🚀 Probando endpoint: Crear Niño');
  console.log('📍 Backend URL:', BACKEND_URL);
  console.log('📋 Datos a enviar:', JSON.stringify(testData, null, 2));
  console.log('\n⏳ Enviando request...\n');

  try {
    const response = await fetch(`${BACKEND_URL}/kafka/apadrinamiento_children_create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Status:', response.status, response.statusText);
    console.log('📄 Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ SUCCESS - Niño creado exitosamente:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ ERROR - El servidor respondió con error:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('\n💥 ERROR - No se pudo conectar con el backend:');
    console.error(error.message);
    console.log('\n🔍 Verifica que:');
    console.log('  1. El backend esté corriendo en', BACKEND_URL);
    console.log('  2. No haya problemas de CORS');
    console.log('  3. La ruta del endpoint sea correcta');
  }
}

// Ejecutar test
testCreateChild();
