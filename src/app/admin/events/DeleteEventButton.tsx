'use client'

export function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This will also remove all registrations.`)) return
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    if (res.ok) window.location.reload()
    else alert('Failed to delete event.')
  }

  return (
    <button type="button" onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">
      Delete
    </button>
  )
}
