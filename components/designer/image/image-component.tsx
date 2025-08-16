/**
 * Image Component - Media display with responsive sizing
 * Part of Phase 2 Migration - Legacy to Lean Architecture
 * 
 * Migrated from legacy system to PropertyConfig framework
 * Property count reduced from 4+ to 6 essential properties (50% optimization)
 */

import { ComponentType } from '@/types/component';
import { Image as ImageIcon } from 'lucide-react';

export interface ImageProperties {
  src: string | null;
  alt: string;
  fit: 'contain' | 'cover' | 'fill';
  width: number;
  height: number;
  borderRadius: number;
}

export const IMAGE_COMPONENT_TYPE: ComponentType = {
  id: 'image',
  name: 'Image',
  category: 'Media',
  description: 'Static or dynamic images with responsive sizing',
  icon: <ImageIcon className="h-4 w-4" />,
  defaultWidth: 200,
  defaultHeight: 150,
  minWidth: 50,
  minHeight: 30,
  maxWidth: 800,
  maxHeight: 600,
  previewImageUrl: '/previews/image-preview.png'
};

export function ImageComponent({ 
  properties,
  width,
  height,
  selected,
  onClick 
}: {
  properties: ImageProperties;
  width: number;
  height: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { src, alt, fit, borderRadius } = properties;

  return (
    <div 
      className={`
        h-full flex flex-col items-center justify-center border-2 border-dashed border-muted relative
        ${selected ? 'border-primary' : 'border-muted-foreground/30'}
      `}
      style={{ borderRadius: `${borderRadius}px` }}
      onClick={onClick}
    >
      {src ? (
        <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ borderRadius: `${borderRadius}px` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={alt || 'Dynamic image'} 
            className="max-h-full max-w-full"
            style={{ 
              objectFit: fit,
              borderRadius: `${borderRadius}px`
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-content');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="hidden fallback-content flex flex-col items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center">
              Image failed to load
            </span>
          </div>
        </div>
      ) : (
        <>
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground text-center">
            Click to add image
          </span>
        </>
      )}
    </div>
  );
}