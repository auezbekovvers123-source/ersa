export default function ProductsPage() {
  return (
    <section>
      <h2>Products</h2>
      <p>
        Список и CRUD: <code>GET/POST /products</code>,{' '}
        <code>GET/PUT/DELETE /products/:id</code>. Категории для формы:{' '}
        <code>GET /categories</code>. Помощник: <code>apiJson</code> в{' '}
        <code>src/api.js</code>.
      </p>
    </section>
  )
}
