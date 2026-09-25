import { useState, useRef } from 'react';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeVerification } from '@/hooks/useResumeVerification';
import { useAutoFitScale } from '@/hooks/useAutoFitScale';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { ResumeHeaderBar } from '@/components/resume/ResumeHeaderBar';
import { ResumeEditorPanel, type EditorTab } from '@/components/editor/ResumeEditorPanel';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { ResumeVerificationModal } from '@/components/resume/ResumeVerificationModal';

export const Resume = () => {
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [activeTab, setActiveTab] = useState<EditorTab>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Resume Data State & Persistence Hook
  const {
    data,
    setData,
    isDummyPreview,
    activeResumeData,
    hasCustomEdits,
    dynamicPages,
    updateHeader,
    updateSkills,
    updateExperienceTitle,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addEducation,
    updateEducation,
    removeEducation,
    updateCertifications,
    loadSampleData,
    resetResumeToEmpty,
  } = useResumeData();

  // 2. Responsive Auto-Fit Zoom Hook
  const { scale, zoomIn, zoomOut, resetZoom } = useAutoFitScale(containerRef, mobileView);

  // 3. User Verification & OTP Hook
  const verification = useResumeVerification({
    data,
    setData,
    isDummyPreview,
    onVerificationComplete: () => {
      pdfDownloader.executeDirectDownload();
    },
  });

  // 4. PDF Generation & Direct Download Hook
  const pdfDownloader = usePdfDownload({
    data,
    verifiedEmail: verification.verifiedEmail,
    mobileView,
    setMobileView,
    openVerificationModal: verification.openVerificationModal,
    onDownloadSuccess: verification.incrementDownloadCount,
  });

  const handleResetResume = () => {
    if (window.confirm('Reset all resume sections to empty builder?')) {
      resetResumeToEmpty();
    }
  };

  return (
    <>
      <style>{`
        .page-sheet {
          -webkit-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
          font-synthesis: none !important;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .page-sheet-container {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .page-sheet-container:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .page-sheet {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 12.7mm !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="flex flex-col min-h-screen w-full bg-apple-white font-sans text-apple-black antialiased">
        {/* Top Header Bar */}
        <ResumeHeaderBar
          mobileView={mobileView}
          setMobileView={setMobileView}
          downloadCount={verification.downloadCount}
          verifiedEmail={verification.verifiedEmail}
          onSwitchEmail={verification.switchEmail}
          hasCustomEdits={hasCustomEdits}
          onResetResume={handleResetResume}
          onInitiateDownload={pdfDownloader.initiateDownload}
          isDownloading={pdfDownloader.isDownloading}
        />

        {/* Main Split Workspace */}
        <div className="flex flex-1 flex-col lg:flex-row w-full max-w-360 mx-auto overflow-hidden print:overflow-visible">
          {/* Left Editor Panel */}
          <ResumeEditorPanel
            mobileView={mobileView}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            data={data}
            updateHeader={updateHeader}
            updateSkills={updateSkills}
            updateExperienceTitle={updateExperienceTitle}
            addExperience={addExperience}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
            addProject={addProject}
            updateProject={updateProject}
            removeProject={removeProject}
            addEducation={addEducation}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
            updateCertifications={updateCertifications}
          />

          {/* Right A4 Preview Canvas */}
          <ResumePreview
            containerRef={containerRef}
            dynamicPages={dynamicPages}
            activeResumeData={activeResumeData}
            scale={scale}
            downloadCount={verification.downloadCount}
            isDummyPreview={isDummyPreview}
            mobileView={mobileView}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onLoadSampleData={loadSampleData}
          />
        </div>

        {/* Email OTP Verification Modal */}
        <ResumeVerificationModal
          isOpen={verification.showVerificationModal}
          onClose={() => verification.setShowVerificationModal(false)}
          verificationStep={verification.verificationStep}
          setVerificationStep={verification.setVerificationStep}
          inputEmail={verification.inputEmail}
          setInputEmail={verification.setInputEmail}
          verificationError={verification.verificationError}
          setVerificationError={verification.setVerificationError}
          isResumeOtpRequesting={verification.isResumeOtpRequesting}
          isResumeOtpVerifying={verification.isResumeOtpVerifying}
          resumeOtp={verification.resumeOtp}
          resumeOtpCountdown={verification.resumeOtpCountdown}
          canResendResumeOtp={verification.canResendResumeOtp}
          resumeOtpInputRefs={verification.resumeOtpInputRefs}
          setResumeOtpDigit={verification.setResumeOtpDigit}
          handleResumeOtpKeyDown={verification.handleResumeOtpKeyDown}
          handleResumeOtpPaste={verification.handleResumeOtpPaste}
          onSendOtp={verification.sendVerificationOtp}
          onVerifyOtp={verification.verifyOtpAndFinish}
          onResetOtp={verification.resetResumeOtp}
          hookError={verification.resumeOtpHookError}
        />
      </div>
    </>
  );
};
