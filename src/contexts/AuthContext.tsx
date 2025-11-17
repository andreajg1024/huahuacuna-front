import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'super_admin' | 'admin' | 'padrino';
export type UserStatus = 'pending' | 'active' | 'blocked' | 'inactive';

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  direccion: string;
  role: UserRole;
  status: UserStatus;
  foto?: string;
  fechaRegistro: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegistrationData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  failedAttempts: number;
  isBlocked: boolean;
  blockTimeRemaining: number;
}

interface RegistrationData {
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  direccion: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    nombre: 'Admin Principal',
    email: 'admin@huahuacuna.org',
    password: 'Admin123',
    telefono: '+57 321 456 7890',
    documento: '1234567890',
    direccion: 'Armenia, Quindío',
    role: 'super_admin',
    status: 'active',
    fechaRegistro: '2023-01-15',
    foto: undefined,
  },
  {
    id: '2',
    nombre: 'María González',
    email: 'maria@huahuacuna.org',
    password: 'Admin123',
    telefono: '+57 321 456 7891',
    documento: '1234567891',
    direccion: 'Armenia, Quindío',
    role: 'admin',
    status: 'active',
    fechaRegistro: '2023-02-20',
    foto: undefined,
    permissions: ['usuarios', 'ninos', 'apadrinamientos', 'eventos'],
  },
  {
    id: '3',
    nombre: 'Carlos Ramírez',
    email: 'carlos@example.com',
    password: 'Padrino123',
    telefono: '+57 321 456 7892',
    documento: '1234567892',
    direccion: 'Bogotá, Colombia',
    role: 'padrino',
    status: 'active',
    fechaRegistro: '2023-06-10',
    foto: undefined,
  },
];

// AuthProvider encapsula toda la lógica de autenticación en memoria:
// - Usa un pequeño "mock" de usuarios con roles (super_admin, admin, padrino).
// - Simula login, registro y actualización de perfil con localStorage.
// - Implementa bloqueo temporal por demasiados intentos fallidos.
// Esta capa está lista para reemplazarse por llamadas reales a un backend en el futuro.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedBlockUntil = localStorage.getItem('block_until');

    if (storedBlockUntil) {
      const blockTime = parseInt(storedBlockUntil);
      if (blockTime > Date.now()) {
        setBlockUntil(blockTime);
      } else {
        localStorage.removeItem('block_until');
      }
    }

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Block timer countdown
  useEffect(() => {
    if (blockUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, blockUntil - Date.now());
        setBlockTimeRemaining(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          setBlockUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem('block_until');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [blockUntil]);

  const login = async (email: string, password: string) => {
    // Check if blocked
    if (blockUntil && blockUntil > Date.now()) {
      throw new Error('Cuenta bloqueada temporalmente. Intenta más tarde.');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const blockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
        setBlockUntil(blockTime);
        localStorage.setItem('block_until', blockTime.toString());
        throw new Error('Cuenta bloqueada temporalmente por 15 minutos');
      }

      throw new Error(`Email o contraseña incorrectos. Te quedan ${5 - newAttempts} intentos.`);
    }

    if (foundUser.status === 'pending') {
      throw new Error('Cuenta pendiente de activación. Revisa tu email.');
    }

    if (foundUser.status === 'inactive' || foundUser.status === 'blocked') {
      throw new Error('Cuenta inactiva. Contacta al administrador.');
    }

    // Successful login
    setFailedAttempts(0);
    localStorage.removeItem('block_until');

    const { password: _, ...userWithoutPassword } = foundUser;
    const mockToken = `mock_jwt_token_${Date.now()}`;

    setUser(userWithoutPassword);
    setToken(mockToken);
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const register = async (data: RegistrationData) => {
    // Check if email already exists
    const exists = mockUsers.find(u => u.email === data.email);
    if (exists) {
      throw new Error('Este email ya está registrado');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In real implementation, this would create a user with 'pending' status
    const newUser: User & { password: string } = {
      id: `${mockUsers.length + 1}`,
      ...data,
      role: 'padrino',
      status: 'pending',
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    mockUsers.push(newUser);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user && !!token,
    failedAttempts,
    isBlocked: blockUntil ? blockUntil > Date.now() : false,
    blockTimeRemaining,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

