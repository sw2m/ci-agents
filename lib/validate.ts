import Ajv from "https://esm.sh/ajv@8.17.1";

const ajv = new Ajv({ allErrors: true });

export interface ValidationResult {
  valid: boolean;
  errors?: string;
}

/**
 * Validate data against a JSON Schema.
 */
export function validate(data: unknown, schema: object): ValidationResult {
  const valid = ajv.validate(schema, data);
  if (valid) {
    return { valid: true };
  }
  const errors = ajv.errorsText(ajv.errors, { separator: "\n" });
  return { valid: false, errors };
}
