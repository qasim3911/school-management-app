import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pakistan School Management SaaS',
  description: 'Enterprise Multi-School Management System for Pakistan with student admissions, fee challans, exam grading, attendance, payroll, and official PDF documents.',
  openGraph: {
    title: 'Pakistan School Management SaaS',
    description: 'Enterprise Multi-School Management System for Pakistan with student admissions, fee challans, exam grading, attendance, payroll, and official PDF documents.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pakistan School Management SaaS',
    description: 'Enterprise Multi-School Management System for Pakistan with student admissions, fee challans, exam grading, attendance, payroll, and official PDF documents.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
