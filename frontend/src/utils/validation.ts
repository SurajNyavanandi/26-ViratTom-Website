export const Validation = {
  isValidEmail(email: string): boolean {
    const clean = (email || '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
  },

  sanitizePhone(phone: string): string {
    return (phone || '').replace(/\D/g, '').slice(-10);
  },

  isValidPhone(phone: string): boolean {
    return this.sanitizePhone(phone).length === 10;
  },

  isValidPostalCode(code: string): boolean {
    const clean = (code || '').replace(/\s/g, '');
    return /^\d{6}$/.test(clean) || /^[A-Za-z0-9-]{3,10}$/.test(clean);
  },

  isValidOtp(otp: string): boolean {
    return /^\d{6}$/.test((otp || '').trim());
  },

  formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return `₹${Number(num || 0).toLocaleString('en-IN')}`;
  },

  calculateAdvance(total: number, percentage = 20): number {
    return Math.round((Number(total) || 0) * (percentage / 100));
  },

  getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  },

  setStorageItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeStorageItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};
