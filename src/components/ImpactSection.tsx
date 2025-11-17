import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Heart, 
  GraduationCap,
  Smile,
  Target,
  MapPin
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ImpactSection() {
  const stats = [
    {
      icon: Users,
      value: '542',
      label: 'Niños Apadrinados',
      description: 'Desde nuestro inicio',
      color: 'from-amber-400 to-amber-500',
    },
    {
      icon: Award,
      value: '21',
      label: 'Años de Experiencia',
      description: 'Transformando vidas',
      color: 'from-emerald-400 to-emerald-500',
    },
    {
      icon: MapPin,
      value: '6+',
      label: 'Municipios Alcanzados',
      description: 'En el Quindío',
      color: 'from-blue-400 to-blue-500',
    },
    {
      icon: Heart,
      value: '180',
      label: 'Padrinos Activos',
      description: 'Comprometidos con el cambio',
      color: 'from-pink-400 to-pink-500',
    },
  ];

  const growthData = [
    { year: '2018', ninos: 320, padrinos: 95 },
    { year: '2019', ninos: 385, padrinos: 115 },
    { year: '2020', ninos: 420, padrinos: 135 },
    { year: '2021', ninos: 475, padrinos: 155 },
    { year: '2022', ninos: 510, padrinos: 170 },
    { year: '2023', ninos: 542, padrinos: 180 },
  ];

  const impactMetrics = [
    { area: 'Educación', value: 95 },
    { area: 'Salud', value: 88 },
    { area: 'Nutrición', value: 92 },
    { area: 'Bienestar', value: 90 },
  ];

  const successStories = [
    {
      name: 'María Camila',
      age: '17 años',
      story: 'Comenzó en el programa a los 8 años. Hoy es la mejor estudiante de su colegio y sueña con ser médica.',
      achievement: 'Becaria universitaria',
      image: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkcmVuJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYxNTUwNzAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Santiago',
      age: '15 años',
      story: 'Descubrió su talento musical en nuestra escuela. Ahora toca en la orquesta juvenil de Armenia.',
      achievement: 'Músico destacado',
      image: 'https://images.unsplash.com/photo-1691333940510-7286846c5342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNsYXNzJTIwY2hpbGRyZW58ZW58MXx8fHwxNzYxNjIyNjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Valentina',
      age: '14 años',
      story: 'Superó dificultades de aprendizaje con nuestro apoyo. Hoy ayuda a otros niños en sus estudios.',
      achievement: 'Tutora voluntaria',
      image: 'https://images.unsplash.com/photo-1592106680408-e7e63efbc7ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHJlYWRpbmclMjBib29rc3xlbnwxfHx8fDE3NjE1OTM3MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const achievements = [
    {
      icon: GraduationCap,
      title: '95% Tasa de Graduación',
      description: 'Los niños apadrinados completan sus estudios exitosamente',
    },
    {
      icon: Smile,
      title: '100% Satisfacción Familiar',
      description: 'Las familias reportan mejoras significativas en calidad de vida',
    },
    {
      icon: Target,
      title: '85% Acceso Universitario',
      description: 'Nuestros egresados continúan con educación superior',
    },
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 text-sm">Nuestro Impacto</span>
          </div>
          <h1 className="text-gray-900 mb-4">Transformando Vidas, Construyendo Futuro</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada número representa una vida transformada, un sueño cumplido, una familia fortalecida
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div className="text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Chart */}
        <div className="mb-20">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-gray-900 mb-6 text-center">Crecimiento e Impacto</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="ninos" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="Niños Apadrinados"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="padrinos" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Padrinos Activos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-sm text-gray-600">Niños Apadrinados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-sm text-gray-600">Padrinos Activos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Metrics */}
        <div className="mb-20">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-gray-900 mb-6 text-center">Indicadores de Impacto</h2>
              <p className="text-center text-gray-600 mb-8">
                Medimos nuestro éxito en el bienestar integral de cada niño
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                * Porcentaje de cumplimiento de objetivos en cada área
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div className="mb-20">
          <h2 className="text-gray-900 text-center mb-12">Logros Destacados</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <achievement.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-3">{achievement.title}</h3>
                  <p className="text-gray-600">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-20">
          <h2 className="text-gray-900 text-center mb-4">Historias de Éxito</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Cada niño tiene una historia única. Estos son algunos de nuestros éxitos más inspiradores.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-56">
                  <ImageWithFallback
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                      {story.achievement}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <h3 className="text-gray-900">{story.name}</h3>
                      <p className="text-sm text-gray-500">{story.age}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{story.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-gray-900 text-center mb-12">El Impacto del Apadrinamiento</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full mb-2">
                    <span className="text-2xl">😔</span>
                  </div>
                  <h3 className="text-gray-900">Antes del Programa</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-500">•</span>
                    <span>Dificultades para acceder a educación de calidad</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-500">•</span>
                    <span>Limitaciones en atención médica y nutricional</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-500">•</span>
                    <span>Pocas oportunidades de desarrollo personal</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-500">•</span>
                    <span>Incertidumbre sobre el futuro</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2">
                    <span className="text-2xl">😊</span>
                  </div>
                  <h3 className="text-gray-900">Con Nuestro Apoyo</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-emerald-500">•</span>
                    <span>Educación completa y de calidad garantizada</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-emerald-500">•</span>
                    <span>Atención integral en salud y nutrición</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-emerald-500">•</span>
                    <span>Desarrollo de talentos y habilidades</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-emerald-500">•</span>
                    <span>Un futuro lleno de oportunidades</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
