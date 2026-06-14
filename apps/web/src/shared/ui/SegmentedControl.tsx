import './primitives.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div aria-label={ariaLabel} className={`ui-segmented ${className}`.trim()} role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          aria-selected={value === option.value}
          className={`ui-segmented__option ${value === option.value ? 'is-active' : ''}`.trim()}
          onClick={() => onChange(option.value)}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
