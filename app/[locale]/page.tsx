import { getIndustriesAction } from '@/lib/actions/industries'
import { PublicIntakeForm } from '@/components/public-intake-form'

export default async function IntakeFormPage() {
  const result = await getIndustriesAction()
  const industries: string[] = result.success
    ? result.data.map((i: any) => i.title)
    : ['Healthcare', 'Real Estate', 'Legal', 'Finance', 'Professional Services', 'Other']

  return <PublicIntakeForm industries={industries} />
}
