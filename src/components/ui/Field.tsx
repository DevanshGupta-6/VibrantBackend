export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink-900/70">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="focus-ring mt-1 w-full rounded-md border border-ink-900/15 px-3 py-2 text-ink-900 placeholder:text-ink-900/30"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  required,
  defaultValue,
  rows = 4
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink-900/70">{label}</span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={rows}
        className="focus-ring mt-1 w-full rounded-md border border-ink-900/15 px-3 py-2 text-ink-900"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink-900/70">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="focus-ring mt-1 w-full rounded-md border border-ink-900/15 bg-white px-3 py-2 text-ink-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
