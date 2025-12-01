import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  CheckCircle2, XCircle, Clock, Download, Share2,
  Facebook, Mail, Heart, AlertCircle, Home
} from 'lucide-react';
import { useDonations } from '../../contexts/DonationsContext';

interface DonationConfirmationPageProps {
  transactionRef: string;
  status: 'aprobada' | 'rechazada' | 'pendiente';
  onNavigate?: (page: string) => void;
}

export const DonationConfirmationPage: React.FC<DonationConfirmationPageProps> = ({
  transactionRef,
  status,
  onNavigate
}) => {
  const { getDonationByTransactionId, updateDonation, needsCertificate } = useDonations();
  const [donation, setDonation] = useState(getDonationByTransactionId(transactionRef));

  useEffect(() => {
    // Update donation status based on PSE callback (RF-034, RF-035)
    if (donation) {
      updateDonation(donation.id, {
        status,
        approvedAt: status === 'aprobada' ? new Date().toISOString() : undefined,
        rejectedAt: status === 'rechazada' ? new Date().toISOString() : undefined,
        confirmationEmailSent: status === 'aprobada'
      });
      
      setDonation({ ...donation, status });
    }
  }, [status]);

  if (!donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl mb-4">Transacción No Encontrada</h2>
            <p className="text-gray-600 mb-6">
              No pudimos encontrar la información de esta transacción.
            </p>
            <Button onClick={() => onNavigate?.('home')}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = (platform: string) => {
    const message = `¡Ayudé a transformar vidas donando a Fundación Huahuacuna! Únete a mí.`;
    const url = 'https://fundacion-huahuacuna.org/donar';

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Dona a Fundación Huahuacuna')}&body=${encodeURIComponent(message + ' ' + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleDownloadReceipt = () => {
    // In real app, would generate and download PDF (RF-034)
    alert('Descargando recibo... (función simulada)');
  };

  const handleDownloadCertificate = () => {
    // In real app, would generate and download certificate PDF (RF-036)
    alert('Descargando certificado tributario... (función simulada)');
  };

  const getImpactMessage = () => {
    const amount = donation.amount;
    if (amount >= 1000000) return 'apadrinar completamente a 1 niño por 1 mes';
    if (amount >= 500000) return 'cubrir la educación completa de 1 niño por 1 mes';
    if (amount >= 300000) return 'proveer atención médica anual para 1 niño';
    if (amount >= 200000) return 'proveer uniforme y calzado para 1 niño';
    if (amount >= 100000) return 'proveer útiles escolares completos para 1 niño';
    if (amount >= 50000) return 'alimentar a 1 niño por 1 mes';
    return 'mejorar la vida de nuestros niños';
  };

  // SUCCESS PAGE
  if (status === 'aprobada') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl mb-4">¡Gracias por tu Donación!</h1>
            <p className="text-xl text-gray-600">
              Tu aporte está haciendo la diferencia
            </p>
          </div>

          {/* Donation Summary */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <h2 className="text-xl mb-6">Resumen de tu Donación</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Monto:</span>
                  <span className="text-2xl font-medium text-[#4A9D5F]">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Fecha:</span>
                  <span>{formatDate(donation.createdAt)}</span>
                </div>

                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Método:</span>
                  <span>PSE - {donation.pseBank || 'Banco'}</span>
                </div>

                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Transacción:</span>
                  <span className="font-mono text-sm">{donation.transactionId}</span>
                </div>

                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Destino:</span>
                  <span>{donation.destination || 'General'}</span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Estado:</span>
                  <Badge className="bg-green-100 text-green-800">APROBADA</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg mb-4">Próximos Pasos</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Recibirás un email de confirmación</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Tu recibo digital está listo</span>
                </div>
                {needsCertificate(donation.amount) && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Tu certificado tributario está disponible</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Impact Message */}
          <Card className="mb-6 bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4" fill="white" />
              <h3 className="text-2xl mb-4">Tu Impacto</h3>
              <p className="text-lg text-white/95">
                Con tu donación de <span className="font-bold">{formatCurrency(donation.amount)}</span> ayudarás a {getImpactMessage()}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button 
              className="w-full bg-[#4A9D5F] hover:bg-[#3B7D4D]"
              onClick={handleDownloadReceipt}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Recibo
            </Button>

            {needsCertificate(donation.amount) && (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleDownloadCertificate}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Certificado
              </Button>
            )}

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => onNavigate?.('donar')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Hacer Otra Donación
            </Button>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => onNavigate?.('home')}
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </div>

          {/* Social Share */}
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg mb-4">¿Te gustó? Compártelo</h3>
              <p className="text-gray-600 mb-4">
                Invita a otros a unirse a esta causa
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  size="sm"
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="w-4 h-4 mr-1" />
                  Facebook
                </Button>
                <Button
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#25D366]/90"
                  onClick={() => handleShare('whatsapp')}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare('email')}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // PENDING PAGE
  if (status === 'pendiente') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <Clock className="w-16 h-16 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-3xl mb-4">Verificando tu Pago</h1>
            <p className="text-gray-600 mb-6">
              Tu transacción está siendo procesada por el banco. Esto puede tomar unos minutos.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Referencia:</strong> {donation.transactionId}
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Te notificaremos por email cuando se confirme el pago
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Clock className="w-4 h-4 mr-2" />
                Actualizar Estado
              </Button>
              <Button onClick={() => onNavigate?.('home')}>
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FAILURE PAGE
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="p-12 text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-3xl mb-4">No se pudo Procesar tu Donación</h1>
          <p className="text-gray-600 mb-6">
            {donation.statusReason || 'Ocurrió un error al procesar el pago'}
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2">Posibles razones:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Fondos insuficientes</li>
              <li>Transacción cancelada</li>
              <li>Error de conexión con el banco</li>
              <li>Datos incorrectos</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            No te preocupes, no se realizó ningún cargo a tu cuenta
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-[#4A9D5F] hover:bg-[#3B7D4D]"
              onClick={() => onNavigate?.('donar')}
            >
              Intentar Nuevamente
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => onNavigate?.('contacto')}
            >
              Contactar Soporte
            </Button>
            <Button 
              variant="ghost"
              className="w-full"
              onClick={() => onNavigate?.('home')}
            >
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for URL navigation
export const useNavigate = () => {
  return (page: string) => {
    // In a real app, this would use React Router
    window.location.hash = page;
  };
};

