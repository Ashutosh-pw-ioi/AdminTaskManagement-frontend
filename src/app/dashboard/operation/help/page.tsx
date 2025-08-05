import type { Metadata } from 'next';
import HelpSection from './HelpSection';

export const metadata: Metadata = {
  title: 'Help & Support',
  description: 'Get assistance with your academic journey',
};

export default function Page() {
  return <HelpSection />;
}