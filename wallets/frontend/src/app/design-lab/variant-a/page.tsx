import type { Metadata } from 'next';
import { VariantA } from '@/components/design-lab/VariantA';

export const metadata: Metadata = {
  title: 'Design Lab Variant A',
  description: 'Asymmetric high-end prototype for WalletRadar frontend direction.',
};

export default function DesignLabVariantAPage() {
  return <VariantA />;
}
