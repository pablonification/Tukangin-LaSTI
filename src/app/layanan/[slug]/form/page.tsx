import { services } from '@/lib/data';
import FormPage from './FormPage';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const svc = services.find((s) => s.slug === slug);
  return {
    title: svc ? `${svc.name} - Form Pemesanan • Tukangin` : 'Form Pemesanan • Tukangin',
  };
}

export default async function Page({ params }: PageProps) {
  const slug = (await params).slug;
  const svc = services.find((s) => s.slug === slug);

  if (!svc) {
    notFound();
  }

  return <FormPage svc={svc} />;
}
