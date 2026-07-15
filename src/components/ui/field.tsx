import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

/**
 * Campos de formulário do design system (label + controle), usados no painel
 * admin. Tokens apenas — ver skill ght-design-system.
 */

const controlClasses =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 " +
  "focus-visible:outline-ring disabled:opacity-50";

interface FieldWrapperProps {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, hint, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function InputField({ label, hint, className, id, ...props }: InputFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper label={label} hint={hint} htmlFor={fieldId}>
      <input id={fieldId} className={cn(controlClasses, className)} {...props} />
    </FieldWrapper>
  );
}

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextareaField({ label, hint, className, id, ...props }: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper label={label} hint={hint} htmlFor={fieldId}>
      <textarea id={fieldId} className={cn(controlClasses, "min-h-24", className)} {...props} />
    </FieldWrapper>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function SelectField({ label, hint, className, id, children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper label={label} hint={hint} htmlFor={fieldId}>
      <select id={fieldId} className={cn(controlClasses, "appearance-none", className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
