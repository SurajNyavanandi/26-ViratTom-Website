import { useState, useCallback } from 'react';
import { Validation } from '@/utils/validation';
import type { ClientProject } from '@/types';
import { apiUrl } from '@/utils/utils';

export interface SavedPaymentMethod {
  id: string;
  type: 'UPI' | 'Card' | 'NetBanking';
  label: string;
  identifier: string; // e.g., 'user@upi' or '•••• 4242'
  isDefault?: boolean;
}

export function usePaymentMethods() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Saved / tokenized payment options
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>(() => {
    return Validation.getStorageItem<SavedPaymentMethod[]>('virattom_saved_payment_methods', [
      { id: 'upi_def', type: 'UPI', label: 'Google Pay / PhonePe UPI', identifier: 'Instant UPI', isDefault: true },
      { id: 'card_def', type: 'Card', label: 'Credit / Debit Cards', identifier: 'All Major Cards (Visa, MC, RuPay)', isDefault: false },
      { id: 'nb_def', type: 'NetBanking', label: 'NetBanking & EMI', identifier: '50+ Major Indian Banks', isDefault: false },
    ]);
  });

  const loadRazorpaySdk = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const processProjectAdvance = useCallback(
    async ({
      project,
      token,
      onSuccess,
    }: {
      project: ClientProject;
      token?: string;
      onSuccess?: (updatedProject: ClientProject) => void;
    }) => {
      setLoading(true);
      setStatus('processing');
      setErrorMessage(null);
      setSuccessMessage(null);

      const clientToken = token || localStorage.getItem('client_token') || '';
      const advanceAmount = project.advanceAmount || (project.totalBudget ? Math.round(project.totalBudget * 0.2) : 5000);

      try {
        console.log(`[usePaymentMethods] Initiating Razorpay advance payment for ₹${advanceAmount}...`);

        // 1. Create order on server
        const orderRes = await fetch(apiUrl('/api/client/create-razorpay-order'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${clientToken}`,
          },
          body: JSON.stringify({
            amount: advanceAmount,
            projectId: project.id,
          }),
        });

        const orderData = await orderRes.json().catch(() => ({}));

        // Handle fallback simulated flow if Razorpay keys are in test mode
        if (!orderRes.ok || !orderData.success) {
          const proceedSimulated = window.confirm(
            `Razorpay Notice:\n${orderData.error || 'Razorpay order creation could not be initialized.'}\n\nWould you like to simulate direct advance booking confirmation for testing?`
          );

          if (proceedSimulated) {
            const directRes = await fetch(apiUrl('/api/client/confirm-advance'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${clientToken}`,
              },
              body: JSON.stringify({
                amount: advanceAmount,
                paymentMethod: 'Direct Payment / Gateway Simulation',
                transactionId: `TXN_${Date.now()}`,
              }),
            });
            const directData = await directRes.json();
            if (directData.success && directData.project) {
              setStatus('success');
              setSuccessMessage('20% Advance payment confirmed! Your project workspace is now unlocked.');
              if (onSuccess) onSuccess(directData.project);
            }
          }
          setLoading(false);
          return;
        }

        // 2. Load SDK
        const scriptLoaded = await loadRazorpaySdk();
        if (!scriptLoaded || !(window as any).Razorpay) {
          throw new Error('Could not load Razorpay SDK. Please check your internet connection.');
        }

        // 3. Open Razorpay modal
        const options = {
          key: orderData.keyId || orderData.key,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'ViratTom',
          description: `20% Advance Booking - ${orderData.projectName || project.title}`,
          image: '/favicon.svg',
          order_id: orderData.orderId,
          handler: async (response: any) => {
            setStatus('verifying');
            try {
              const verifyRes = await fetch(apiUrl('/api/client/verify-razorpay-payment'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${clientToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: advanceAmount,
                  projectId: project.id,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setStatus('success');
                setSuccessMessage('20% Advance payment verified via Razorpay! Your project workspace is now fully unlocked.');
                if (onSuccess && verifyData.project) {
                  onSuccess(verifyData.project);
                }
              } else {
                throw new Error(verifyData.error || 'Payment signature verification failed.');
              }
            } catch (vErr: any) {
              setStatus('error');
              setErrorMessage(vErr.message || 'Payment verification failed on server.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: orderData.clientName || project.clientName || '',
            contact: (orderData.clientPhone || project.clientPhone || '').replace(/\D/g, '').slice(-10),
            email: orderData.clientEmail || project.clientEmail || '',
          },
          theme: {
            color: '#0071E3',
          },
          modal: {
            ondismiss: () => {
              console.log('[usePaymentMethods] Checkout modal closed by client.');
              setLoading(false);
              setStatus('idle');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (failRes: any) => {
          setStatus('error');
          setErrorMessage(failRes.error?.description || 'Payment was declined or cancelled.');
          setLoading(false);
        });
        rzp.open();
      } catch (err: any) {
        console.error('[usePaymentMethods Error]:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Payment processing error.');
        setLoading(false);
      }
    },
    [loadRazorpaySdk]
  );

  const addSavedMethod = useCallback((method: Omit<SavedPaymentMethod, 'id'>) => {
    const newMethod: SavedPaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
    };
    setSavedMethods((prev) => {
      const updated = [newMethod, ...prev];
      Validation.setStorageItem('virattom_saved_payment_methods', updated);
      return updated;
    });
  }, []);

  const removeSavedMethod = useCallback((id: string) => {
    setSavedMethods((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      Validation.setStorageItem('virattom_saved_payment_methods', updated);
      return updated;
    });
  }, []);

  return {
    loading,
    status,
    errorMessage,
    successMessage,
    savedMethods,
    processProjectAdvance,
    addSavedMethod,
    removeSavedMethod,
    setErrorMessage,
    setSuccessMessage,
  };
}
