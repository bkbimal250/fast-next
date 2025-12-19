/**
 * SEO Head component for dynamic meta tags
 */

interface SeoHeadProps {
  title: string
  description: string
  canonical?: string
  schema?: object
}

export default function SeoHead({ title, description, canonical, schema }: SeoHeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </>
  )
}

