import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { 
  Package, ArrowLeft, Send, MapPin, Phone, Mail as MailIcon,
  Clock, CheckCircle2
} from 'lucide-react';
import { useDonations } from '../../contexts/DonationsContext';
import { toast } from 'sonner';

interface InKindDonationFormProps {
  onBack?: () => void;
}

const DONATION_CATEGORIES = [
  { id: 'ropa', name: 'Ropa y Calzado', icon: '👕', items: ['Ropa para niños (5-15 años)', 'Uniformes escolares', 'Zapatos', 'Medias, ropa interior'] },
  { id: 'utiles', name: 'Útiles Escolares', icon: '📚', items: ['Cuadernos, lápices, colores', 'Mochilas', 'Libros de texto', 'Material didáctico'] },
  { id: 'alimentos', name: 'Alimentos', icon: '🍎', items: ['No perecederos', 'Cereales, granos', 'Enlatados', 'Aceite, azúcar'] },
  { id: 'muebles', name: 'Muebles y Electrodomésticos', icon: '🏠', items: ['Mesas, sillas', 'Computadores', 'Electrodomésticos', 'Estanterías'] },
  { id: 'recreativo', name: 'Material Recreativo', icon: '🎨', items: ['Juguetes', 'Material deportivo', 'Instrumentos musicales', 'Arte y manualidades'] },
  { id: 'tiempo', name: 'Tiempo (Voluntariado)', icon: '⏰', items: ['Horas de trabajo', 'Talleres o capacitaciones', 'Servicios profesionales'] },
  { id: 'otro', name: 'Otro', icon: '📦', items: [] }
];

export const InKindDonationForm: React.FC<InKindDonationFormProps> = ({ onBack }) => {
  const { createInKindDonation } = useDonations();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donationType: '',
    description: '',
    estimatedValue: '',
    requiresPickup: 'no',
    pickupAddress: '',
    preferredDate: '',
    comments: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!formData.donorName.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!formData.donorEmail.trim() || !formData.donorEmail.includes('@')) {
      toast.error('El email es requerido y debe ser válido');
      return false;
    }
    if (!formData.donorPhone.trim()) {
      toast.error('El teléfono es requerido');
      return false;
    }
    if (!formData.donationType) {
      toast.error('Selecciona el tipo de donación');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('La descripción es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      // Create in-kind donation (RF-037)
      createInKindDonation({
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        donationType: formData.donationType,
        description: formData.description,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        requiresPickup: formData.requiresPickup === 'yes',
        pickupAddress: formData.pickupAddress || undefined,
        preferredDate: formData.preferredDate || undefined,
        comments: formData.comments || undefined
      });

      toast.success('Solicitud enviada exitosamente');
      setSubmitted(true);

      // In real app: Send email notification (RF-037)
      
    } catch (error) {
      toast.error('Error al enviar la solicitud');
      console.error(error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl mb-4">¡Gracias por tu Donación!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Hemos recibido tu solicitud. Nos pondremos en contacto pronto.
              </p>
              
              <Card className="bg-gray-50 mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg mb-4">Información de Contacto</h3>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Calle 20 #14-22, Armenia, Quindío</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">+57 (6) 745-1234</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">donaciones@fundacion-huahuacuna.org</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Lun-Vie: 8:00 AM - 5:00 PM | Sáb: 9:00 AM - 1:00 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSubmitted(false)}>
                  Hacer Otra Donación
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}
          <h1 className="text-4xl mb-2">Donación en Especie</h1>
          <p className="text-xl text-gray-600">
            Dona artículos, tiempo o servicios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Needed Items Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Artículos que Necesitamos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {DONATION_CATEGORIES.map(category => (
                  <div key={category.id} className="pb-4 border-b last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    {category.items.length > 0 && (
                      <ul className="text-sm text-gray-600 space-y-1 ml-8">
                        {category.items.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Coordinar Donación</CardTitle>
                <p className="text-sm text-gray-600">
                  Completa el formulario y nos pondremos en contacto contigo
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información de Contacto</h3>
                    
                    <div>
                      <Label htmlFor="donorName">Nombre Completo *</Label>
                      <Input
                        id="donorName"
                        value={formData.donorName}
                        onChange={(e) => updateField('donorName', e.target.value)}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="donorEmail">Email *</Label>
                        <Input
                          id="donorEmail"
                          type="email"
                          value={formData.donorEmail}
                          onChange={(e) => updateField('donorEmail', e.target.value)}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="donorPhone">Teléfono *</Label>
                        <Input
                          id="donorPhone"
                          type="tel"
                          value={formData.donorPhone}
                          onChange={(e) => updateField('donorPhone', e.target.value)}
                          placeholder="3001234567"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Donation Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Detalles de la Donación</h3>

                    <div>
                      <Label htmlFor="donationType">Tipo de Donación *</Label>
                      <Select value={formData.donationType} onValueChange={(v) => updateField('donationType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {DONATION_CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción de los Artículos *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Describe qué vas a donar, cantidad, estado, etc."
                        rows={4}
                        maxLength={500}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/500 caracteres
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="estimatedValue">Valor Aproximado (opcional)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => updateField('estimatedValue', e.target.value)}
                        placeholder="100000"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Para efectos de certificado tributario
                      </p>
                    </div>
                  </div>

                  {/* Pickup Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Logística</h3>

                    <div>
                      <Label>¿Requieres Recolección?</Label>
                      <RadioGroup value={formData.requiresPickup} onValueChange={(v) => updateField('requiresPickup', v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-pickup" />
                          <Label htmlFor="no-pickup" className="cursor-pointer">
                            No, lo llevaré personalmente
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes-pickup" />
                          <Label htmlFor="yes-pickup" className="cursor-pointer">
                            Sí, necesito que recojan
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.requiresPickup === 'yes' && (
                      <>
                        <div>
                          <Label htmlFor="pickupAddress">Dirección de Recolección</Label>
                          <Textarea
                            id="pickupAddress"
                            value={formData.pickupAddress}
                            onChange={(e) => updateField('pickupAddress', e.target.value)}
                            placeholder="Calle 123 #45-67, Armenia, Quindío"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="preferredDate">Fecha Preferida</Label>
                          <Input
                            id="preferredDate"
                            type="date"
                            value={formData.preferredDate}
                            onChange={(e) => updateField('preferredDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="comments">Comentarios Adicionales</Label>
                      <Textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => updateField('comments', e.target.value)}
                        placeholder="Cualquier información adicional..."
                        rows={3}
                        maxLength={300}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    {onBack && (
                      <Button type="button" variant="outline" onClick={onBack}>
                        Cancelar
                      </Button>
                    )}
                    <Button type="submit" className="bg-[#4A9D5F] hover:bg-[#3B7D4D]">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Solicitud
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Información de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#4A9D5F]" />
                    Dirección
                  </h4>
                  <p className="text-gray-600 ml-6">Calle 20 #14-22, Armenia, Quindío</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#4A9D5F]" />
                    Teléfono
                  </h4>
                  <p className="text-gray-600 ml-6">+57 (6) 745-1234</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-[#4A9D5F]" />
                    Email
                  </h4>
                  <p className="text-gray-600 ml-6">donaciones@fundacion-huahuacuna.org</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4A9D5F]" />
                    Horario de Recepción
                  </h4>
                  <div className="text-gray-600 ml-6">
                    <p>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
                    <p>Sábados: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 text-blue-900">Instrucciones:</h4>
                    <ul className="text-sm text-blue-900 space-y-1">
                      <li>• Por favor coordina tu visita previamente</li>
                      <li>• Los artículos deben estar en buen estado</li>
                      <li>• Recibirás un comprobante de donación</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

