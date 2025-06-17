
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, className, ...rest }) => {
  return <IconComponent className={className || "h-5 w-5"} {...rest} />;
};

export default Icon;
