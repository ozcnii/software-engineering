interface AuthFieldProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  value: string;
  error?: string;
  hint?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export function AuthField({
  id,
  label,
  type,
  placeholder,
  value,
  error,
  hint,
  required = false,
  onChange,
}: AuthFieldProps) {
  return (
    <div className="form-row">
      <label className="label" htmlFor={id}>
        {label} {required ? <span className="required">*</span> : null}
      </label>
      <input
        className="input"
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <div className="hint">{hint}</div> : null}
      {error ? <div className="err">{error}</div> : null}
    </div>
  );
}
