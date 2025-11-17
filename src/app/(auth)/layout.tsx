import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk • Tukangin",
  description: "Masuk untuk memesan layanan perbaikan rumah",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
