/**
 * Base Service
 * 
 * Clase base con utilidades comunes para todos los servicios
 */

export class BaseService {
  /**
   * Validar formato ISO 8601 para fecha
   */
  protected isValidISODate(dateString: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    if (!isoDateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validar URL
   */
  protected isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validar email
   */
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calcular edad desde fecha de nacimiento
   */
  protected calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Crear slug desde título
   */
  protected createSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  /**
   * Formatear fecha a ISO 8601
   */
  protected toISOString(date: Date | string): string {
    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return date.toISOString();
  }

  /**
   * Validar longitud de string
   */
  protected validateLength(
    value: string,
    fieldName: string,
    min?: number,
    max?: number
  ): void {
    if (min !== undefined && value.length < min) {
      throw new Error(`${fieldName} debe tener al menos ${min} caracteres`);
    }
    if (max !== undefined && value.length > max) {
      throw new Error(`${fieldName} debe tener máximo ${max} caracteres`);
    }
  }

  /**
   * Validar campo requerido
   */
  protected validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} es requerido`);
    }
  }
}
