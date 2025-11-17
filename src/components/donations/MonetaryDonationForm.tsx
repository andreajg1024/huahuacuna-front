import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { 
  CreditCard, Shield, CheckCircle2, ArrowRight, X,
  Info, Lock, AlertCircle
} from 'lucide-react';
import { useDonations } from '../../contexts/DonationsContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from './DonationConfirmationPage';

interface MonetaryDonationFormProps {
  onClose?: () => void;
}

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

const DESTINATIONS = [
  'General (donde más se necesite)',
  'Apadrinamiento',
  'Educación',
  'Salud y Nutrición',
  'Infraestructura'
];

const ID_TYPES = [
  'Cédula de Ciudadanía',
  'Cédula de Extranjería',
  'NIT',
  'Pasaporte'
];

export const MonetaryDonationForm: React.FC<MonetaryDonationFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createDonation, needsCertificate } = useDonations();
  const [step, setStep] = useState(1);
  const [transactionId, setTransactionId] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Amount
    amount: '',
    customAmount: '',
    destination: 'General (donde más se necesite)',
    donationType: 'one-time',
    
    // Step 2 - Personal Info
    fullName: user?.nombre || '',
    idType: 'Cédula de Ciudadanía',
    idNumber: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Colombia',
    subscribeNewsletter: false,
    isAnonymous: false,
    
    // Step 3 - Payment
    paymentMethod: 'pse',
    acceptTerms: false
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedAmount = formData.amount === 'custom' 
    ? parseInt(formData.customAmount) || 0
    : parseInt(formData.amount) || 0;

  const getImpactMessage = (amount: number) => {
    if (amount >= 1000000) return 'Con $1,000,000 puedes proveer apadrinamiento completo para 1 niño por 1 mes';
    if (amount >= 500000) return 'Con $500,000 puedes cubrir educación completa para 1 niño por 1 mes';
    if (amount >= 300000) return 'Con $300,000 puedes cubrir control médico anual para 1 niño';
    if (amount >= 200000) return 'Con $200,000 puedes proveer uniforme y calzado para 1 niño';
    if (amount >= 100000) return 'Con $100,000 puedes proveer útiles escolares completos para 1 niño';
    if (amount >= 50000) return 'Con $50,000 puedes alimentar a un niño por 1 mes';
    if (amount >= 10000) return 'Tu donación ayudará a mejorar la vida de nuestros niños';
    return '';
  };

  const validateStep1 = () => {
    const amount = selectedAmount;
    
    if (!amount || amount < 10000) {
      toast.error('El monto mínimo es $10,000 COP');
      return false;
    }
    
    if (amount > 50000000) {
      toast.error('Por favor contacta con nosotros para donaciones mayores a $50,000,000');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName.trim()) {
      toast.error('El nombre completo es requerido');
      return false;
    }
    
    if (!formData.idNumber.trim()) {
      toast.error('El número de documento es requerido');
      return false;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('El email es requerido y debe ser válido');
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      // Create donation record (RF-034, RF-035)
      const donationId = createDonation({
        amount: selectedAmount,
        currency: 'COP',
        donorId: user?.id,
        donorName: formData.fullName,
        donorIdType: formData.idType,
        donorIdNumber: formData.idNumber,
        donorEmail: formData.email,
        donorPhone: formData.phone,
        donorAddress: formData.address,
        donorCity: formData.city,
        donorCountry: formData.country,
        isAnonymous: formData.isAnonymous,
        destination: formData.destination,
        donationType: 'monetaria',
        isRecurring: false,
        paymentMethod: formData.paymentMethod as any,
        status: 'pendiente' // Will be updated after PSE callback
      });

      // In a real implementation, this would redirect to PSE (RF-034)
      // For now, we'll simulate the process
      toast.success('Redirigiendo a PSE...');
      
      // Simulate PSE redirect
      setTimeout(() => {
        // Simulate successful payment
        const txId = `DON-${Date.now()}`;
        setTransactionId(txId);
        
        // In real app: window.location.href = PSE_URL
        // For demo: show confirmation
        window.location.href = `/donaciones/confirmacion?ref=${txId}&status=aprobada`;
      }, 1500);

    } catch (error) {
      toast.error('Error al procesar la donación');
      console.error(error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Hacer una Donación</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Tu aporte es 100% seguro y deducible de impuestos
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mt-6">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                s === step ? 'bg-[#4A9D5F] text-white' :
                s < step ? 'bg-[#4A9D5F]/20 text-[#4A9D5F]' :
                'bg-gray-200 text-gray-400'
              }`}>
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 ${s < step ? 'bg-[#4A9D5F]' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1 - Amount & Destination */}
        {step === 1 && (
          <>
            <div>
              <Label>Selecciona el Monto *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {PRESET_AMOUNTS.map(amount => (
                  <Button
                    key={amount}
                    type="button"
                    variant={formData.amount === amount.toString() ? 'default' : 'outline'}
                    className={formData.amount === amount.toString() ? 'bg-[#4A9D5F] hover:bg-[#3B7D4D]' : ''}
                    onClick={() => {
                      updateField('amount', amount.toString());
                      updateField('customAmount', '');
                    }}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={formData.amount === 'custom' ? 'default' : 'outline'}
                  className={formData.amount === 'custom' ? 'bg-[#4A9D5F] hover:bg-[#3B7D4D]' : ''}
                  onClick={() => updateField('amount', 'custom')}
                >
                  Otro monto
                </Button>
              </div>

              {formData.amount === 'custom' && (
                <div className="mt-4">
                  <Label htmlFor="customAmount">Monto Personalizado (COP) *</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="10000"
                    max="50000000"
                    value={formData.customAmount}
                    onChange={(e) => updateField('customAmount', e.target.value)}
                    placeholder="Ej: 150000"
                    className="text-xl"
                  />
                  <p className="text-sm text-gray-500 mt-1">Mínimo $10,000 COP</p>
                </div>
              )}
            </div>

            {selectedAmount > 0 && (
              <Card className="bg-[#4A9D5F]/10 border-[#4A9D5F]">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">
                    <Info className="w-4 h-4 inline mr-2" />
                    {getImpactMessage(selectedAmount)}
                  </p>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="destination">Destino de la Donación</Label>
              <Select value={formData.destination} onValueChange={(v) => updateField('destination', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Puedes elegir a qué programa va tu aporte
              </p>
            </div>

            {selectedAmount >= 50000 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Tu donación califica para certificado tributario (deducible de impuestos)
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" onClick={handleNextStep} className="bg-[#4A9D5F] hover:bg-[#3B7D4D]">
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Step 2 - Personal Information */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Juan Pérez García"
                />
              </div>

              <div>
                <Label htmlFor="idType">Tipo de Documento *</Label>
                <Select value={formData.idType} onValueChange={(v) => updateField('idType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="idNumber">Número de Documento *</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => updateField('idNumber', e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="3001234567"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Calle 123 #45-67"
                />
                {needsCertificate(selectedAmount) && (
                  <p className="text-sm text-gray-500 mt-1">
                    Requerida para certificado tributario
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Armenia"
                />
              </div>

              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.subscribeNewsletter}
                  onCheckedChange={(checked) => updateField('subscribeNewsletter', checked)}
                />
                <Label htmlFor="newsletter" className="cursor-pointer">
                  Mantenerme informado sobre el impacto de mi donación
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => updateField('isAnonymous', checked)}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  No mostrar mi nombre públicamente
                </Label>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button type="button" onClick={handleNextStep} className="bg-[#4A9D5F] hover:bg-[#3B7D4D]">
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3 - Payment Method */}
        {step === 3 && (
          <>
            <div>
              <Label>Método de Pago *</Label>
              <RadioGroup value={formData.paymentMethod} onValueChange={(v) => updateField('paymentMethod', v)}>
                <Card className={`cursor-pointer ${formData.paymentMethod === 'pse' ? 'border-[#4A9D5F] border-2' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pse" id="pse" />
                      <Label htmlFor="pse" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">PSE - Pagos Seguros en Línea</p>
                            <p className="text-sm text-gray-600">Pago directo desde tu banco</p>
                          </div>
                          <Badge>Recomendado</Badge>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className="opacity-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" disabled />
                      <Label htmlFor="card" className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Tarjeta de Crédito/Débito</p>
                            <p className="text-sm text-gray-600">Próximamente</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>

              {formData.paymentMethod === 'pse' && (
                <Card className="mt-4 bg-blue-50 border-blue-200">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-blue-900 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Serás redirigido a la pasarela segura de PSE
                    </p>
                    <p className="text-sm text-blue-900">• Elige tu banco y completa el pago</p>
                    <p className="text-sm text-blue-900">• El proceso es 100% seguro</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Donation Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-lg mb-4">Resumen de Donación</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-medium text-xl">{formatCurrency(selectedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destino:</span>
                    <span>{formData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método:</span>
                    <span>PSE</span>
                  </div>
                  {needsCertificate(selectedAmount) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificado:</span>
                      <Badge className="bg-green-100 text-green-800">Sí (deducible)</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => updateField('acceptTerms', checked)}
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                Acepto los <a href="#" className="text-[#4A9D5F] underline">términos y condiciones</a> y la{' '}
                <a href="#" className="text-[#4A9D5F] underline">política de privacidad</a>
              </Label>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <Lock className="w-5 h-5 text-[#4A9D5F]" />
              <span>Pago 100% seguro. Tus datos están protegidos.</span>
            </div>

            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                className="bg-[#4A9D5F] hover:bg-[#3B7D4D]"
                disabled={!formData.acceptTerms}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Proceder al Pago
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
