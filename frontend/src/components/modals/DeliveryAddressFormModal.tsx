import React from 'react';
import { X, MapPin, Building, Home, Briefcase, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddressForm, type AddressFormData } from '@/hooks/useAddressForm';

interface DeliveryAddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressFormData) => void;
  initialAddress?: Partial<AddressFormData>;
  title?: string;
}

export const DeliveryAddressFormModal = React.memo<DeliveryAddressFormModalProps>(({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  title = 'Delivery & Billing Address',
}) => {
  const {
    address,
    errors,
    touched,
    submitAttempted,
    updateField,
    validateAndGet,
    reset,
  } = useAddressForm(initialAddress);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateAndGet();
    if (result.success && result.data) {
      onSave(result.data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-apple-gray-200 dark:border-[#38383A]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-apple-black dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-[12.5px] text-apple-gray-500 dark:text-apple-gray-400">
                Official billing and deliverable invoice details
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-2 rounded-full text-apple-gray-400 hover:text-apple-black dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-[13px] font-semibold text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Address Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Billing', label: 'Billing', icon: Building },
                { id: 'Office', label: 'Office', icon: Briefcase },
                { id: 'Residence', label: 'Residence', icon: Home },
              ].map((type) => {
                const isSelected = address.addressType === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateField('addressType', type.id)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[13px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-apple-blue bg-apple-blue/10 text-apple-blue'
                        : 'border-apple-gray-200 dark:border-[#38383A] text-apple-gray-600 dark:text-apple-gray-400 hover:border-apple-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
                Full Name / Business Name
              </label>
              <Input
                type="text"
                placeholder="e.g. John Doe / Tech Corp"
                value={address.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={`rounded-xl h-11 text-[14px] ${
                  (touched.fullName || submitAttempted) && errors.fullName ? 'border-apple-red' : ''
                }`}
              />
              {(touched.fullName || submitAttempted) && errors.fullName && (
                <p className="text-[12px] text-apple-red mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
                Contact Phone
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13.5px] text-apple-gray-400 font-medium">
                  +91
                </span>
                <Input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={address.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`pl-12 rounded-xl h-11 text-[14px] ${
                    (touched.phone || submitAttempted) && errors.phone ? 'border-apple-red' : ''
                  }`}
                />
              </div>
              {(touched.phone || submitAttempted) && errors.phone && (
                <p className="text-[12px] text-apple-red mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
              Street Address & Landmark
            </label>
            <Input
              type="text"
              placeholder="e.g. 402 Silicon Heights, MG Road"
              value={address.street}
              onChange={(e) => updateField('street', e.target.value)}
              className={`rounded-xl h-11 text-[14px] ${
                (touched.street || submitAttempted) && errors.street ? 'border-apple-red' : ''
              }`}
            />
            {(touched.street || submitAttempted) && errors.street && (
              <p className="text-[12px] text-apple-red mt-1">{errors.street}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
              Apartment, Suite, Unit (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Suite 400"
              value={address.apartment || ''}
              onChange={(e) => updateField('apartment', e.target.value)}
              className="rounded-xl h-11 text-[14px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
                City
              </label>
              <Input
                type="text"
                placeholder="Bengaluru"
                value={address.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={`rounded-xl h-11 text-[14px] ${
                  (touched.city || submitAttempted) && errors.city ? 'border-apple-red' : ''
                }`}
              />
              {(touched.city || submitAttempted) && errors.city && (
                <p className="text-[12px] text-apple-red mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
                State
              </label>
              <Input
                type="text"
                placeholder="Karnataka"
                value={address.state}
                onChange={(e) => updateField('state', e.target.value)}
                className={`rounded-xl h-11 text-[14px] ${
                  (touched.state || submitAttempted) && errors.state ? 'border-apple-red' : ''
                }`}
              />
              {(touched.state || submitAttempted) && errors.state && (
                <p className="text-[12px] text-apple-red mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1 text-apple-gray-700 dark:text-apple-gray-300">
                PIN Code
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="560001"
                value={address.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                className={`rounded-xl h-11 text-[14px] ${
                  (touched.postalCode || submitAttempted) && errors.postalCode ? 'border-apple-red' : ''
                }`}
              />
              {(touched.postalCode || submitAttempted) && errors.postalCode && (
                <p className="text-[12px] text-apple-red mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-apple-gray-200 dark:border-[#38383A] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-xl h-11 px-5 text-[14px]"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl h-11 px-6 text-[14px] gap-2">
              <Check className="h-4 w-4" />
              <span>Save Address</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

DeliveryAddressFormModal.displayName = 'DeliveryAddressFormModal';
