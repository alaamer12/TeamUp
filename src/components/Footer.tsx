import React, { memo } from 'react';
import { Github, Mail, Code, BookOpen } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { Separator } from './ui/separator';

// Memoized Logo Component - Handles logo display with theme awareness
const Logo = memo(() => (
  <div className="flex items-center justify-center md:justify-start mb-3 md:mb-2">
    <img 
      src="/favicon.svg" 
      alt="TeamUp Logo" 
      className="h-6 w-auto sm:h-7 md:h-8 dark:hidden" 
      loading="lazy"
    />
    <img 
      src="/favicon.svg" 
      alt="TeamUp Logo" 
      className="h-6 w-auto sm:h-7 md:h-8 hidden dark:block" 
      loading="lazy"
    />
    <span className="ml-2 sm:ml-3 text-lg sm:text-xl md:text-2xl font-bold">
      TeamUp
    </span>
  </div>
));

// Memoized Link Component - Reusable link with icon
const LinkItem = memo(({ link, className = "" }: { link: any, className?: string }) => (
  <li>
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center justify-center md:justify-start group ${className}`}
    >
      <link.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform duration-200" />
      <span className="truncate">{link.name}</span>
    </a>
  </li>
));

// Memoized Social Icon Component - For icon-only social links
const SocialIcon = memo(({ link }: { link: any }) => (
  <a 
    key={link.name} 
    href={link.url} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
    aria-label={link.name}
  >
    <link.icon className="w-4 h-4 sm:w-5 sm:h-5" />
  </a>
));

// About Section Component - Handles logo and motto display
const AboutSection = memo(() => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center md:items-start space-y-2">
      <Logo />
      <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left max-w-full sm:max-w-xs lg:max-w-sm px-2 md:px-0 leading-relaxed">
        {t('footer.motto')}
      </p>
    </div>
  );
});

// Links Section Component - Handles resources and contact links
const LinksSection = memo(() => {
  const { t } = useLanguage();

  const resourceLinks = [
    {
      name: t('footer.source_code'),
      icon: Code,
      url: 'https://github.com/alaamer12/TeamUp',
    },
    {
      name: t('footer.docs'),
      icon: BookOpen,
      url: 'https://github.com/alaamer12/TeamUp/tree/main/docs',
    },
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/alaamer12',
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:ahmedmuhmmed239@gmail.com',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full">
      {/* Resources Section */}
      <div className="text-center sm:text-left">
        <h3 className="font-semibold mb-3 sm:mb-4 text-primary text-sm sm:text-base">
          {t('footer.docs')}
        </h3>
        <ul className="space-y-2 sm:space-y-2.5">
          {resourceLinks.map(link => (
            <LinkItem key={link.name} link={link} />
          ))}
        </ul>
      </div>

      {/* Contact Section */}
      <div className="text-center sm:text-left">
        <h3 className="font-semibold mb-3 sm:mb-4 text-primary text-sm sm:text-base">
          {t('footer.contact')}
        </h3>
        <ul className="space-y-2 sm:space-y-2.5">
          {socialLinks.map(link => (
            <LinkItem key={link.name} link={link} />
          ))}
        </ul>
      </div>
    </div>
  );
});

// Copyright Component - Handles copyright information
const Copyright = memo(() => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center text-xs text-muted-foreground px-4">
      &copy; {new Date().getFullYear()} TeamUp. {t('footer.all_rights_reserved')}
    </div>
  );
});

// Main Footer Component - Orchestrates all sections
const Footer = memo(() => {
  return (
    <footer className="bg-muted/40 dark:bg-muted/20 border-t border-border/50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* About Section - Full width on mobile/tablet, 1/3 on desktop */}
          <div className="lg:col-span-1">
            <AboutSection />
          </div>

          {/* Links Section - Full width on mobile/tablet, 1/3 on desktop */}
          <div className="lg:col-span-2">
            <LinksSection />
          </div>

        </div>

        {/* Separator */}
        <Separator className="my-6 sm:my-8" />

        {/* Copyright */}
        <Copyright />
      </div>
    </footer>
  );
});

// Set display names for better debugging
Logo.displayName = 'Logo';
LinkItem.displayName = 'LinkItem';
SocialIcon.displayName = 'SocialIcon';
AboutSection.displayName = 'AboutSection';
LinksSection.displayName = 'LinksSection';
Copyright.displayName = 'Copyright';
Footer.displayName = 'Footer';

export default Footer;