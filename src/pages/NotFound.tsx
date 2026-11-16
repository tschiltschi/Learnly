import { useT } from '@/i18n';
import { Compass } from 'lucide-react';
import { EmptyState, Button } from '@/components/ui';
import { navigate } from '@/lib/router';

export function NotFound() {
  const t = useT();
  return (
    <div className="pt-16">
      <EmptyState icon={Compass} title={t("This page doesn't exist")} description={t('The link may be outdated. Head back to your dashboard to keep learning.')} action={<Button onClick={() => navigate('dashboard')}>{t('Go to dashboard')}</Button>} />
    </div>
  );
}
