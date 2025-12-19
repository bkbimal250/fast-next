/**
 * City page - Dynamic route for city-based job listings
 */

export default function CityPage({ params }: { params: { city: string } }) {
  return (
    <main>
      <h1>SPA Jobs in {params.city}</h1>
    </main>
  )
}

