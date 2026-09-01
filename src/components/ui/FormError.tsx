export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-magenta-500/10 px-3 py-2 text-sm text-magenta-600">
      {message}
    </p>
  );
}
