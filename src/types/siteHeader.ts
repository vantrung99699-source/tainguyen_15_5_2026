export interface HeaderNavLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface SiteHeaderConfig {
  topBarEnabled: boolean;
  contactDisplay: string;
  contactPhone: string;
  contactEmail: string;
  contactLinkType: 'phone' | 'email' | 'none';
  navLinks: HeaderNavLink[];
  topBarCustomText: string;
  showTopBarCustomText: boolean;
  marqueeEnabled: boolean;
  marqueeLines: string[];
}
