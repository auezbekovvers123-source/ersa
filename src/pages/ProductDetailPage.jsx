import { useParams } from 'react-router-dom'

export default function ProductDetailPage() {
  const { id } = useParams()
  return (
    <section>
      <h2>Product #{id}</h2>
      <p>Person 3: <code>GET /products/:id</code>, edit and delete here.</p>
    </section>
  )
}
