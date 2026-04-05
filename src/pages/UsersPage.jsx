export default function UsersPage() {
  return (
    <section>
      <h2>Users</h2>
      <p>
        Person 3: list/detail/edit/delete via <code>/users</code>. Optional:{' '}
        <code>PATCH /users/:id/password</code> for password change form.
      </p>
    </section>
  )
}
