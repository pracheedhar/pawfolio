export default function DataState({ loading, error, empty, retry }) {
  if (loading)
    return (
      <p role="status" className="p-6 text-center text-gray-500">
        Loading…
      </p>
    );
  if (error)
    return (
      <div role="alert" className="p-6 text-center text-red-600">
        {error}{' '}
        {retry && (
          <button onClick={retry} className="underline">
            Try again
          </button>
        )}
      </div>
    );
  if (empty) return <p className="p-6 text-center text-gray-500">Nothing here yet.</p>;
  return null;
}
