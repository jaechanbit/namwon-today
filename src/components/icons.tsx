import type { SVGProps } from "react";
const Icon = ({ children, ...props }: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
export const HomeIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></Icon>;
export const NewsIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M4 4h13v16H4z"/><path d="M8 8h5M8 12h5M8 16h3M17 8h3v10a2 2 0 0 1-2 2h-1"/></Icon>;
export const SettingsIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/></Icon>;
export const PaperclipIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m20.5 11.5-8.7 8.7a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 1 1 5 5l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.6-8.6"/></Icon>;
export const ArrowIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M5 12h14M14 7l5 5-5 5"/></Icon>;
export const PhoneIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></Icon>;
