declare module 'workflows-lib/lib/components/template/TemplateCard' {
    import React from 'react';
    
    interface Template {
      name: string;
      title?: string;
      maintainer: string;
      repository?: string;
      description?: string;
    }
    
    interface TemplateCardProps {
      template: Template;
    }
    
    export const TemplateCard: React.FC<TemplateCardProps>;
    export default TemplateCard;
}