import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

interface TabsProps<K extends string> {
  label: string;
  items: { key: K; label: ReactNode }[];
  value: K;
  onChange: (key: K) => void;
  style?: CSSProperties;
}

/** Roving-tabindex tab list: arrows, Home and End move between tabs. */
export default function Tabs<K extends string>({ label, items, value, onChange, style }: TabsProps<K>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = items.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(items[next].key);
    refs.current[next]?.focus();
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} style={style}>
      {items.map((item, index) => (
        <button
          key={item.key}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="tab"
          aria-selected={item.key === value}
          tabIndex={item.key === value ? 0 : -1}
          onClick={() => onChange(item.key)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
