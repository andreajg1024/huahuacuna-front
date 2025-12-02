import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  ArrowLeft,
  Award
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface PadrinoDocumentsProps {
  onNavigate: (page: string) => void;
}

export function PadrinoDocuments({ onNavigate }: PadrinoDocumentsProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock donations data - esto debería venir del contexto de donaciones
  const donations = [
    { year: 2024, amount: 1200000, date: '2024-12-01' },
    { year: 2023, amount: 960000, date: '2023-12-15' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const numberToWords = (num: number): string => {
    const units = ['', 'Mil', 'Millones', 'Mil Millones'];
    const ones = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
    const teens = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
    const tens = ['', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
    const hundreds = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

    if (num === 0) return 'Cero';
    if (num === 100) return 'Cien';

    const convertThreeDigits = (n: number): string => {
      let result = '';
      
      const h = Math.floor(n / 100);
      const t = Math.floor((n % 100) / 10);
      const o = n % 10;

      if (h > 0) {
        result += hundreds[h];
        if (t > 0 || o > 0) result += ' ';
      }

      if (t === 1) {
        result += teens[o];
      } else {
        if (t > 0) {
          result += tens[t];
          if (o > 0) result += ' y ';
        }
        if (o > 0 && t !== 1) {
          result += ones[o];
        }
      }

      return result;
    };

    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;

    let result = '';
    if (thousands > 0) {
      if (thousands === 1) {
        result = 'Mil';
      } else {
        result = convertThreeDigits(thousands) + ' Mil';
      }
      if (remainder > 0) result += ' ';
    }
    if (remainder > 0) {
      result += convertThreeDigits(remainder);
    }

    return result;
  };

  const generateDonationCertificate = async (donation: typeof donations[0]) => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Cargar logo (si existe)
      // En producción, usa la URL completa del logo
      const logoUrl = '/logo-huahuacuna.png';
      
      // Márgenes
      const margin = 25;
      let yPosition = 30;

      // Header - Logo centrado
      try {
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => resolve(null); // Continuar sin logo si falla
        });
        pdf.addImage(img, 'PNG', pageWidth / 2 - 25, yPosition, 50, 20);
        yPosition += 30;
      } catch (e) {
        yPosition += 10;
      }

      // Título principal
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FUNDACIÓN HUAHUACUNA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      pdf.setFontSize(12);
      pdf.text('NIT: 801.005.003-0', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(18);
      pdf.text('CERTIFICADO DE DONACIÓN', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Cuerpo del certificado
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      const bodyText = `En nuestra calidad de Representante legal y revisor fiscal de la Fundación Huahuacuna nos permitimos certificar para efectos de declaración de renta que durante el año ${donation.year} ${user?.nombre ? 'el(la) señor(a) ' + user.nombre.toUpperCase() : 'el padrino'} identificado(a) con C.C. ${user?.documentId || 'XXXXXXXXX'} realizó donaciones mediante transferencia electrónica a esta fundación por valor de ${formatCurrency(donation.amount)} (${numberToWords(Math.floor(donation.amount / 1000))} Mil Pesos M/Cte.).`;

      const lines1 = pdf.splitTextToSize(bodyText, pageWidth - 2 * margin);
      pdf.text(lines1, margin, yPosition);
      yPosition += lines1.length * 7 + 10;

      const paragraph2 = 'Nuestra Fundación es una entidad sin ánimo de lucro sometida a vigilancia oficial del estado, cuyo objeto social es atender a la población infantil en estado de vulnerabilidad.';
      const lines2 = pdf.splitTextToSize(paragraph2, pageWidth - 2 * margin);
      pdf.text(lines2, margin, yPosition);
      yPosition += lines2.length * 7 + 10;

      const paragraph3 = `Atendiendo a disposiciones legales y tributarias hemos cumplido con el deber de presentar la declaración de renta por el periodo ${donation.year}, igualmente los ingresos que se han recibido por donaciones se han manejado en depósitos o inversiones en establecimientos financieros autorizados.`;
      const lines3 = pdf.splitTextToSize(paragraph3, pageWidth - 2 * margin);
      pdf.text(lines3, margin, yPosition);
      yPosition += lines3.length * 7 + 10;

      const paragraph4 = 'Además, certificamos que los excedentes de la fundación son reinvertidos en las actividades señaladas en los estatutos.';
      const lines4 = pdf.splitTextToSize(paragraph4, pageWidth - 2 * margin);
      pdf.text(lines4, margin, yPosition);
      yPosition += lines4.length * 7 + 15;

      // Fecha del certificado
      const today = new Date();
      const dateText = `El presente certificado se firma en Armenia Q, a los ${today.getDate()} días del mes de ${today.toLocaleDateString('es-CO', { month: 'long' })} de ${today.getFullYear()}.`;
      const lines5 = pdf.splitTextToSize(dateText, pageWidth - 2 * margin);
      pdf.text(lines5, margin, yPosition);
      yPosition += lines5.length * 7 + 30;

      // Firmas
      const signatureY = pageHeight - 60;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('_____________________________', margin + 10, signatureY);
      pdf.text('_____________________________', pageWidth - margin - 60, signatureY);
      
      pdf.setFontSize(10);
      pdf.text('Representante Legal', margin + 10, signatureY + 7);
      pdf.text('Revisor Fiscal', pageWidth - margin - 60, signatureY + 7);
      
      pdf.text('C.C. XXXX.XXX.XX', margin + 10, signatureY + 12);
      pdf.text('T.P. 71136-T', pageWidth - margin - 60, signatureY + 12);

      // Guardar PDF
      pdf.save(`Certificado_Donacion_${donation.year}_${user?.nombre?.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('Certificado generado exitosamente');
    } catch (error) {
      console.error('Error generando certificado:', error);
      toast.error('Error al generar el certificado');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header with back button */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('padrino')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-gray-900 mb-2">Mis Documentos</h1>
          <p className="text-gray-600">Certificados de donación y reportes de la Fundación Huahuacuna</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-2">Certificados de Donación</h3>
              <p className="text-gray-600 text-sm mb-3">
                Los certificados de donación son documentos oficiales que validan tus aportes a la Fundación Huahuacuna 
                y pueden ser utilizados para efectos tributarios en tu declaración de renta.
              </p>
              <p className="text-gray-600 text-sm">
                Descarga los certificados correspondientes a cada año fiscal haciendo clic en el botón de descarga.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations List */}
      <div className="grid gap-4">
        <h2 className="text-gray-900 mb-4">Certificados Disponibles</h2>
        
        {donations.length > 0 ? (
          donations.map((donation, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-1">
                        Certificado de Donación {donation.year}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(donation.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(donation.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateDonationCertificate(donation)}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">No hay certificados disponibles</h3>
              <p className="text-gray-600">
                Aún no tienes donaciones registradas. Una vez realices donaciones, podrás descargar tus certificados aquí.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Documents */}
      <div className="mt-8">
        <h2 className="text-gray-900 mb-4">Otros Documentos</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="text-gray-900 font-medium">Informe Anual de Actividades 2024</h4>
                    <p className="text-sm text-gray-600">Reporte de las actividades de la fundación</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="text-gray-900 font-medium">Estados Financieros 2023</h4>
                    <p className="text-sm text-gray-600">Transparencia financiera de la fundación</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
