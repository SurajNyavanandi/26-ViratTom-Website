export interface LeadFormValues {
  projectType: string;
  name: string;
  email: string;
  phone: string;
  budget: string;
  scope: string;
}

export interface LeadFormErrors {
  projectType?: string;
  name?: string;
  email?: string;
  phone?: string;
  budget?: string;
  scope?: string;
}

export const Validation = {
  isValidEmail(email: string): boolean {
    const clean = (email || '').trim().toLowerCase();
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);
  },

  sanitizePhone(phone: string): string {
    return (phone || '').replace(/\D/g, '').slice(-10);
  },

  isValidPhone(phone: string): boolean {
    const clean = this.sanitizePhone(phone);
    if (clean.length !== 10) return false;
    if (!['6', '7', '8', '9'].includes(clean[0])) return false;
    if (/^(\d)\1{9}$/.test(clean)) return false;
    if (['0123456789', '1234567890', '0987654321', '9876543210'].includes(clean)) return false;
    return true;
  },

  validateName(name: string): string | null {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      return 'Full name is required.';
    }
    if (trimmed.length < 2) {
      return 'Please enter at least 2 characters for your name.';
    }
    if (trimmed.length > 60) {
      return 'Name must not exceed 60 characters.';
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
      return 'Name should only contain letters, spaces, and hyphens.';
    }
    return null;
  },

  validateEmail(email: string): string | null {
    const trimmed = (email || '').trim();
    if (!trimmed) {
      return 'Email address is required.';
    }
    if (!this.isValidEmail(trimmed)) {
      return 'Please enter a valid email address (e.g., name@company.com).';
    }
    return null;
  },

  validatePhone(phone: string): string | null {
    const trimmed = (phone || '').trim();
    if (!trimmed) {
      return 'Mobile number is required.';
    }
    const clean = this.sanitizePhone(trimmed);
    if (clean.length !== 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }
    if (!['6', '7', '8', '9'].includes(clean[0])) {
      return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
    }
    if (!this.isValidPhone(clean)) {
      return 'Please enter a valid, active mobile number.';
    }
    return null;
  },

  validateBudget(budget: string | number, minThreshold?: number): string | null {
    const str = String(budget || '').trim();
    if (!str) {
      return 'Estimated budget is required.';
    }
    const num = Number(str);
    if (isNaN(num) || num <= 0) {
      return 'Please enter a positive estimated budget amount.';
    }
    if (minThreshold && minThreshold > 0 && num < minThreshold) {
      return `Minimum budget for this project is ₹${minThreshold.toLocaleString('en-IN')}.`;
    }
    if (num > 3000000) {
      return 'Maximum budget value is ₹30,00,000 for standard web inquiries.';
    }
    return null;
  },

  validateScope(scope: string): string | null {
    const trimmed = (scope || '').trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.length > 2000) {
      return 'Project scope must be under 2000 characters.';
    }
    return null;
  },

  validateProjectType(projectType: string): string | null {
    const trimmed = (projectType || '').trim();
    if (!trimmed) {
      return 'Please select a project type.';
    }
    return null;
  },

  validateLeadForm(values: LeadFormValues, minBudget?: number): {
    isValid: boolean;
    errors: LeadFormErrors;
    firstErrorField: keyof LeadFormValues | null;
  } {
    const errors: LeadFormErrors = {};

    const typeErr = this.validateProjectType(values.projectType);
    if (typeErr) errors.projectType = typeErr;

    const nameErr = this.validateName(values.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = this.validateEmail(values.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = this.validatePhone(values.phone);
    if (phoneErr) errors.phone = phoneErr;

    const budgetErr = this.validateBudget(values.budget, minBudget);
    if (budgetErr) errors.budget = budgetErr;

    const scopeErr = this.validateScope(values.scope);
    if (scopeErr) errors.scope = scopeErr;

    const order: Array<keyof LeadFormValues> = ['projectType', 'name', 'email', 'phone', 'budget', 'scope'];
    const firstErrorField = order.find(k => Boolean(errors[k])) || null;

    return { isValid: Object.keys(errors).length === 0, errors, firstErrorField };
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
