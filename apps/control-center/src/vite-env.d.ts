/// <reference types="vite/client" />

declare module "virtual:trama-ecosystem-validator" {
  type ValidationError = { instancePath?: string; message?: string };
  type Validator = ((value: unknown) => boolean) & { errors?: ValidationError[] | null };
  const validate: Validator;
  export default validate;
}
