export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder = '',
  children,
  ...rest
}) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label className="form-field__label" htmlFor={name}>
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      {children ? (
        children
      ) : (
        <input
          className="form-field__input"
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...rest}
        />
      )}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
