import { FeatureDashboard } from '@/components/feature-registry'

export const metadata = {
  title: 'Feature Registry - ReportBuilder',
  description: 'Track and manage all features to prevent UI/functionality gaps'
}

export default function FeaturesPage() {
  return <FeatureDashboard />
}