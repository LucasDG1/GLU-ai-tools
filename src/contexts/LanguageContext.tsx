import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  nl: {
    // Header
    'header.aiTools': 'AI Tools',
    'header.cms': 'CMS Dashboard',
    'header.searchPlaceholder': 'Zoek AI tools...',
    'header.tagline': 'AI Tools voor Studenten',

    // Hero Section
    'hero.title': 'AI Tools voor Creatieve Studenten',
    'hero.subtitle': 'Ontdek de krachtigste AI-tools voor al je vakken aan het Grafisch Lyceum Utrecht',
    'hero.cta': 'Ontdek Tools',

    // Subjects
    'subjects.design': 'Design',
    'subjects.development': 'Development',
    'subjects.marketing': 'Marketing',
    'subjects.videoEditing': 'Video editing/productie',
    'subjects.socialMedia': 'Social media',
    'subjects.gameArt': 'Game art / 3D modeling',
    'subjects.gameDesign': 'Game design',
    'subjects.vrDevelopment': 'VR development',
    'subjects.brandDesign': 'Brand design',
    'subjects.contentDesign': 'Content design',
    'subjects.artDesign': 'Art design',
    'subjects.mediaProduction': 'Media productie (DTP)',

    // AI Tools
    'tools.advantages': 'Voordelen',
    'tools.disadvantages': 'Nadelen',
    'tools.learnMore': 'Meer info',
    'tools.addReview': 'Beoordeling toevoegen',
    'tools.uploadWork': 'Werk uploaden',

    // Reviews
    'reviews.title': 'Student beoordelingen',
    'reviews.yourReview': 'Jouw beoordeling',
    'reviews.rating': 'Beoordeling',
    'reviews.comment': 'Opmerking',
    'reviews.submit': 'Versturen',
    'reviews.anonymous': 'Anoniem',

    // Upload
    'upload.title': 'Upload je werk',
    'upload.description': 'Deel je creaties gemaakt met deze AI tool',
    'upload.dragDrop': 'Sleep bestanden hierheen of klik om te uploaden',
    'upload.submit': 'Uploaden',
    'upload.selectedFiles': 'Geselecteerde bestanden',
    'upload.send': 'Versturen',
    'upload.remove': 'Verwijderen',
    'upload.selectFiles': 'Selecteer eerst bestanden',

    // CMS
    'cms.title': 'Content Management Systeem',
    'cms.subjects': 'Vakken',
    'cms.tools': 'AI Tools',
    'cms.reviews': 'Beoordelingen',
    'cms.uploads': 'Uploads',
    'cms.admins': 'Beheerders',
    'cms.add': 'Toevoegen',
    'cms.edit': 'Bewerken',
    'cms.delete': 'Verwijderen',
    'cms.save': 'Opslaan',
    'cms.cancel': 'Annuleren',
    'cms.confirmDelete': 'Weet je zeker dat je dit wilt verwijderen?',
    'cms.deleteSuccess': 'Succesvol verwijderd!',
    'cms.deleteFailed': 'Verwijderen mislukt',

    // Admin Management
    'admin.title': 'Beheerders beheren',
    'admin.addAdmin': 'Beheerder toevoegen',
    'admin.editAdmin': 'Beheerder bewerken',
    'admin.name': 'Naam',
    'admin.email': 'E-mail',
    'admin.password': 'Wachtwoord',
    'admin.created': 'Aangemaakt',
    'admin.actions': 'Acties',
    'admin.superAdmin': 'Super Admin',
    'admin.noAdmins': 'Geen beheerders gevonden',
    'admin.cannotDelete': 'Kan deze beheerder niet verwijderen',
    'admin.emailExists': 'Er bestaat al een beheerder met dit e-mailadres',
    'admin.onlyOwnAccount': 'Je kunt alleen je eigen account bewerken',
    'admin.onlySuperAdmin': 'Alleen super beheerders kunnen nieuwe accounts aanmaken',
    'admin.onlyDeleteSuper': 'Alleen super beheerders kunnen accounts verwijderen',

    // Footer
    'footer.description': 'Studenten ondersteunen met AI-tools voor creatief onderwijs en professionele ontwikkeling.',
    'footer.quickLinks': 'Snelle links',
    'footer.subjects': 'Vakken',
    'footer.copyright': '© 2024 Grafisch Lyceum Utrecht. Alle rechten voorbehouden.',

    // Auth
    'auth.login': 'Inloggen',
    'auth.logout': 'Uitloggen',
    'auth.email': 'E-mailadres',
    'auth.password': 'Wachtwoord',
    'auth.signIn': 'Aanmelden',
    'auth.invalidCredentials': 'Ongeldige inloggegevens',
    'auth.adminLogin': 'Admin Login',
    'auth.accessCms': 'Toegang tot het Content Management Systeem',
    'auth.backToHome': 'Terug naar home',

    // Common
    'common.loading': 'Laden...',
    'common.error': 'Er is een fout opgetreden',
    'common.success': 'Gelukt!',
    'common.name': 'Naam',
    'common.description': 'Beschrijving',
    'common.image': 'Afbeelding',
  },
  en: {
    // Header
    'header.aiTools': 'AI Tools',
    'header.cms': 'CMS Dashboard',
    'header.searchPlaceholder': 'Search AI tools...',
    'header.tagline': 'AI Tools for Students',

    // Hero Section
    'hero.title': 'AI Tools for Creative Students',
    'hero.subtitle': 'Discover the most powerful AI tools for all your subjects at Grafisch Lyceum Utrecht',
    'hero.cta': 'Explore Tools',

    // Subjects
    'subjects.design': 'Design',
    'subjects.development': 'Development',
    'subjects.marketing': 'Marketing',
    'subjects.videoEditing': 'Video editing/production',
    'subjects.socialMedia': 'Social media',
    'subjects.gameArt': 'Game art / 3D modeling',
    'subjects.gameDesign': 'Game design',
    'subjects.vrDevelopment': 'VR development',
    'subjects.brandDesign': 'Brand design',
    'subjects.contentDesign': 'Content design',
    'subjects.artDesign': 'Art design',
    'subjects.mediaProduction': 'Media production (DTP)',

    // AI Tools
    'tools.advantages': 'Advantages',
    'tools.disadvantages': 'Disadvantages',
    'tools.learnMore': 'Learn more',
    'tools.addReview': 'Add review',
    'tools.uploadWork': 'Upload work',

    // Reviews
    'reviews.title': 'Student reviews',
    'reviews.yourReview': 'Your review',
    'reviews.rating': 'Rating',
    'reviews.comment': 'Comment',
    'reviews.submit': 'Submit',
    'reviews.anonymous': 'Anonymous',

    // Upload
    'upload.title': 'Upload your work',
    'upload.description': 'Share your creations made with this AI tool',
    'upload.dragDrop': 'Drag files here or click to upload',
    'upload.submit': 'Upload',
    'upload.selectedFiles': 'Selected files',
    'upload.send': 'Send',
    'upload.remove': 'Remove',
    'upload.selectFiles': 'Please select files first',

    // CMS
    'cms.title': 'Content Management System',
    'cms.subjects': 'Subjects',
    'cms.tools': 'AI Tools',
    'cms.reviews': 'Reviews',
    'cms.uploads': 'Uploads',
    'cms.admins': 'Admins',
    'cms.add': 'Add',
    'cms.edit': 'Edit',
    'cms.delete': 'Delete',
    'cms.save': 'Save',
    'cms.cancel': 'Cancel',
    'cms.confirmDelete': 'Are you sure you want to delete this?',
    'cms.deleteSuccess': 'Successfully deleted!',
    'cms.deleteFailed': 'Failed to delete',

    // Admin Management
    'admin.title': 'Manage Administrators',
    'admin.addAdmin': 'Add Administrator',
    'admin.editAdmin': 'Edit Administrator',
    'admin.name': 'Name',
    'admin.email': 'Email',
    'admin.password': 'Password',
    'admin.created': 'Created',
    'admin.actions': 'Actions',
    'admin.superAdmin': 'Super Admin',
    'admin.noAdmins': 'No administrators found',
    'admin.cannotDelete': 'Cannot delete this administrator',
    'admin.emailExists': 'An administrator with this email already exists',
    'admin.onlyOwnAccount': 'You can only edit your own account',
    'admin.onlySuperAdmin': 'Only super administrators can create new accounts',
    'admin.onlyDeleteSuper': 'Only super administrators can delete accounts',

    // Footer
    'footer.description': 'Empowering students with AI tools for creative education and professional development.',
    'footer.quickLinks': 'Quick Links',
    'footer.subjects': 'Subjects',
    'footer.copyright': '© 2024 Grafisch Lyceum Utrecht. All rights reserved.',

    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.signIn': 'Sign In',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.adminLogin': 'Admin Login',
    'auth.accessCms': 'Access the Content Management System',
    'auth.backToHome': 'Back to home',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.image': 'Image',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('nl');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['nl']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}