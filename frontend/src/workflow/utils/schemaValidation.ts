import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

// Build one AJV per schema instance so defaults/coercions are accurate per template
export function buildAjv() {
  const ajv = new Ajv({
    allErrors: true,
    useDefaults: true, 
    coerceTypes: false, 
    strict: false,
  });
  addFormats(ajv);
  return ajv;
}

export type ValidationResult<T> = {
  ok: boolean;
  data: T;
  errors: ErrorObject[] | null | undefined;
};

// Apply defaults/coercions by running validate once (mutates data)
export function validateWithDefaults<T extends object>(
  ajv: Ajv,
  schema: object,
  data: T
): ValidationResult<T> {
  const validate = ajv.compile(schema);
  const copy: any = structuredClone(data ?? {});
  const ok = validate(copy) as boolean;
  return { ok, data: copy as T, errors: validate.errors };
}

// Turn AJV errors into readable strings with current values
export function formatAjvErrors(
  errors: ErrorObject[] | null | undefined,
  data: unknown
): string[] {
  if (!errors?.length) return [];
  return errors.map(err => {
    const path = err.instancePath || '';
    const where = path ? path : '(root)';
    const val = getByPath(data, path);
    const valStr =
      typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'undefined');
    return `${where} — ${err.message}; value: ${valStr}`;
  });
}

function getByPath(data: any, instancePath: string) {
  if (!instancePath) return data;
  // instancePath is like "/properties/x" but Ajv uses JSON Pointer style (e.g. "/nprocs")
  const parts = instancePath.split('/').filter(Boolean);
  return parts.reduce((acc, key) => (acc ? acc[key] : undefined), data);
}
