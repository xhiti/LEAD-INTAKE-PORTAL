import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'fr', 'es', 'sq']

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!locales.includes(locale as string)) notFound()

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
