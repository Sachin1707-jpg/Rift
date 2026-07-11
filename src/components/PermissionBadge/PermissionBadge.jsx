import React from 'react';
import { cn } from '../../utils/helpers';
import { Globe, Send, ShoppingBag } from 'lucide-react';

const permConfig = {
  Browse: 'bg-mock-scope-browse/12 text-mock-scope-browse',
  Post: 'bg-mock-scope-post/12 text-mock-scope-post',
  Purchase: 'bg-mock-scope-purchase/12 text-mock-scope-purchase',
};

export const PermissionBadge = ({ permission, className }) => {
  const config = permConfig[permission] || 'bg-white/10 text-white';

  return (
    <span className={cn(
      "font-mono text-[11.5px] px-[10px] py-[5px] rounded-[7px] font-medium lowercase",
      config,
      className
    )}>
      {permission}
    </span>
  );
};
