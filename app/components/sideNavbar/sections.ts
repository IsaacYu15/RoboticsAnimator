export interface NavSection {
  name: string;
  href: string;
}

const sections: NavSection[] = [
  { name: 'Home', href: '/dashboard' },
  { name: 'Modules', href: '/dashboard/modules' },
  { name: 'Animations', href: '/dashboard/animations'}
];

export default sections;