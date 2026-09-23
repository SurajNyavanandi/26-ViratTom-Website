import { useState, useCallback, useMemo } from 'react';
import { Validation } from '@/lib/validation';

export interface AddressFormData {
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'Office' | 'Residence' | 'Billing';
  isDefault?: boolean;
}

export const DEFAULT_ADDRESS: AddressFormData = {
  fullName: '',
  phone: '',
  street: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  addressType: 'Billing',
  isDefault: true,
};

export function useAddressForm(initialData?: Partial<AddressFormData>) {
  const [address, setAddress] = useState<AddressFormData>({
    ...DEFAULT_ADDRESS,
    ...initialData,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!address.fullName.trim()) {
      errs.fullName = 'Full Name or Company is required.';
    }

    if (!Validation.isValidPhone(address.phone)) {
      errs.phone = 'Valid 10-digit phone number is required.';
    }

    if (!address.street.trim() || address.street.trim().length < 5) {
      errs.street = 'Street address must be at least 5 characters.';
    }

    if (!address.city.trim()) {
      errs.city = 'City is required.';
    }

    if (!address.state.trim()) {
      errs.state = 'State / Province is required.';
    }

    if (!Validation.isValidPostalCode(address.postalCode)) {
      errs.postalCode = 'Valid 6-digit PIN code is required.';
    }

    return errs;
  }, [address]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const updateField = useCallback((field: keyof AddressFormData, value: any) => {
    setAddress((prev) => ({
      ...prev,
      [field]: field === 'phone' ? Validation.sanitizePhone(value) : value,
    }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const setAddressData = useCallback((data: Partial<AddressFormData>) => {
    setAddress((prev) => ({ ...prev, ...data }));
  }, []);

  const reset = useCallback(() => {
    setAddress({ ...DEFAULT_ADDRESS, ...initialData });
    setTouched({});
    setSubmitAttempted(false);
  }, [initialData]);

  const formattedAddress = useMemo(() => {
    const parts = [
      address.fullName,
      address.street,
      address.apartment,
      `${address.city}, ${address.state} - ${address.postalCode}`,
      address.country,
      address.phone ? `Phone: +91 ${address.phone}` : '',
    ].filter(Boolean);
    return parts.join('\n');
  }, [address]);

  const validateAndGet = useCallback((): { success: boolean; data?: AddressFormData; errors: Record<string, string> } => {
    setSubmitAttempted(true);
    if (!isValid) {
      return { success: false, errors };
    }
    return { success: true, data: address, errors: {} };
  }, [isValid, errors, address]);

  return {
    address,
    errors,
    isValid,
    touched,
    submitAttempted,
    formattedAddress,
    updateField,
    setAddressData,
    reset,
    validateAndGet,
  };
}
