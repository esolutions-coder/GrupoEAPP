import React from 'react';
import { Facebook, Linkedin, Instagram, Youtube, Twitter } from 'lucide-react';

interface SocialMediaLinksProps {
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ 
  variant = 'horizontal', 
  size = 'md',
  showLabels = false 
}) => {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/grupoea',
      color: 'hover:text-blue-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/company/grupo-ea',
      color: 'hover:text-blue-700'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/grupoea',
      color: 'hover:text-pink-600'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://www.youtube.com/c/grupoea',
      color: 'hover:text-red-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://www.twitter.com/grupoea',
      color: 'hover:text-blue-400'
    }
  ];

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const containerClasses = variant === 'horizontal' 
    ? 'flex space-x-4' 
    : 'flex flex-col space-y-3';

  return (
    <div className={containerClasses}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center space-x-2 text-gray-400 ${social.color} transition-colors duration-200 group`}
          aria-label={`Síguenos en ${social.name}`}
        >
          <social.icon className={`${sizeClasses[size]} group-hover:scale-110 transition-transform`} />
          {showLabels && (
            <span className="text-sm font-medium">{social.name}</span>
          )}
        </a>
      ))}
    </div>
  );
};

export default SocialMediaLinks;