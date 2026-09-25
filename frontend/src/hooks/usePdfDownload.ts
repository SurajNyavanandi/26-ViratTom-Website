import { useState, useCallback } from 'react';
import { exportResumePdf } from '@/utils/pdfExporter';
import type { ResumeData } from '@/types/resume';

interface UsePdfDownloadProps {
  data: ResumeData;
  verifiedEmail: string;
  mobileView: 'editor' | 'preview';
  setMobileView: (view: 'editor' | 'preview') => void;
  openVerificationModal: (email?: string) => void;
  onDownloadSuccess: (email?: string) => void;
}

export const usePdfDownload = ({
  data,
  verifiedEmail,
  mobileView,
  setMobileView,
  openVerificationModal,
  onDownloadSuccess,
}: UsePdfDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const executeDirectDownload = useCallback(async () => {
    const previousMobileView = mobileView;

    try {
      setIsDownloading(true);

      // Ensure preview DOM is active if currently on mobile editor tab
      if (mobileView === 'editor') {
        setMobileView('preview');
        await new Promise((r) => setTimeout(r, 120));
      }

      // Wait a tick for fonts/layout to settle
      await new Promise((r) => setTimeout(r, 60));

      const pageElements = document.querySelectorAll<HTMLElement>('.page-sheet');
      if (!pageElements || pageElements.length === 0) {
        console.warn('[usePdfDownload] No .page-sheet elements found in DOM, falling back to print');
        window.print();
        return;
      }

      await exportResumePdf(pageElements, data.header.name);
      onDownloadSuccess(verifiedEmail || data.header.email);
    } catch (err) {
      console.error('[usePdfDownload] Error generating PDF from preview, providing print dialog:', err);
      window.print();
    } finally {
      if (previousMobileView === 'editor') {
        setMobileView('editor');
      }
      setIsDownloading(false);
    }
  }, [mobileView, setMobileView, data.header.name, data.header.email, verifiedEmail, onDownloadSuccess]);

  const initiateDownload = useCallback(() => {
    if (verifiedEmail) {
      // Ensure the latest draft is saved for this email before downloading
      try {
        localStorage.setItem(`virattom_resume_user_${verifiedEmail}`, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to sync user draft:', e);
      }
      executeDirectDownload();
    } else {
      openVerificationModal(data.header.email || '');
    }
  }, [verifiedEmail, data, executeDirectDownload, openVerificationModal]);

  return {
    isDownloading,
    initiateDownload,
    executeDirectDownload,
  };
};
