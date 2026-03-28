import { useEffect, useRef, useState } from "react";

import HeroOutlinePencilIcon from "@/icons/pencil";

interface EditableFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}

function EditableField(props: EditableFieldProps) {
  const { value, onChange, placeholder, className } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(draft.trim() || value);
  };

  if (editing) {
    return (
      <textarea
        className={`w-full bg-transparent border-b border-indigo-400 outline-none text-inherit placeholder-white/40 resize-none ${className}`}
        placeholder={placeholder}
        ref={inputRef}
        value={draft}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
      />
    );
  }

  return (
    <span
      className={`flex items-center gap-1 cursor-pointer group/field ${className}`}
      onClick={() => setEditing(true)}
    >
      <span className={value ? "" : "text-white/30 italic"}>
        {value || placeholder}
      </span>
      <span className="opacity-0 group-hover/field:opacity-60 transition-opacity text-white/70 shrink-0">
        <HeroOutlinePencilIcon />
      </span>
    </span>
  );
}

export default EditableField;
