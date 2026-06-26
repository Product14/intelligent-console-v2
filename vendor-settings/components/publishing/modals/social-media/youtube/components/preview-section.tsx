import React from 'react';

// @ts-ignore
import SVG from '@spyne-console/design-system/svg';

interface PreviewSectionProps {
  title: string;
  description: string;
  tags: string[];
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  title,
  description,
  tags,
}) => (
  <div className="space-y-6">
    <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
      Preview
    </h3>

    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <SVG iconName="youtube" width={24} height={24} />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-gray-900">
            {title || 'Top Deals on Used & Certified Vehicles This Week'}
          </h4>
          <p className="text-xs text-gray-600">
            {description || 'Rev up your passion for cars...'}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <span key={index} className="text-xs text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>0 Likes</span>
            <span>0 Views</span>
            <span>- Ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
