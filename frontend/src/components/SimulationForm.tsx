import React from 'react';

export interface SimulationFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'checkbox';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
}

interface SimulationFormProps {
  fields: SimulationFormField[];
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
}

const SimulationForm: React.FC<SimulationFormProps> = ({
  fields,
  onChange,
  onSubmit,
  submitLabel = 'Run Simulation',
  loading = false
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-gray-700 mb-2">{field.label}</label>
            {field.type === 'checkbox' ? (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={e => onChange(field.name, e.target.checked)}
                  className="mr-2"
                  disabled={field.disabled || loading}
                />
                <span>{field.placeholder}</span>
              </label>
            ) : (
              <input
                type={field.type}
                value={field.value}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.placeholder}
                onChange={e => onChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={field.disabled || loading}
              />
            )}
            {field.helpText && (
              <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>
      <button
        type="submit"
        className={`px-4 py-2 rounded text-white font-medium ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={loading}
      >
        {loading ? 'Running...' : submitLabel}
      </button>
    </form>
  );
};

export default SimulationForm;
