/**
 * Area page - Dynamic route for area-based job listings
 */

export default function AreaPage({ 
  params 
}: { 
  params: { city: string; area: string } 
}) {
  return (
    <main>
      <h1>SPA Jobs in {params.area}, {params.city}</h1>
    </main>
  )
}

