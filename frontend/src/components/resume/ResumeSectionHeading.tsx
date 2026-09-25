import React from 'react';

interface ResumeSectionHeadingProps {
  title: string;
  isDummyPreview?: boolean;
}

export const ResumeSectionHeading: React.FC<ResumeSectionHeadingProps> = ({
  title,
  isDummyPreview = false,
}) => {
  return (
    <div
      className={`resume-section-heading text-[11pt] font-bold block w-full ${
        isDummyPreview ? 'text-[#333333] border-b border-[#d0d0d0]' : 'text-[#000000] border-b border-[#000000]'
      }`}
      style={{
        display: 'block',
        width: '100%',
        lineHeight: '1.45',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: isDummyPreview ? '#d0d0d0' : '#000000',
        paddingBottom: '4px',
        marginBottom: '6px',
        boxSizing: 'border-box',
      }}
    >
      {title}
    </div>
  );
};
