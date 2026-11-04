export function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export function optionalField(form: FormData, name: string) {
  return field(form, name).trim() || null;
}

export function isChecked(form: FormData, name: string) {
  return form.get(name) === "on";
}

export function numberField(form: FormData, name: string) {
  return Number(field(form, name) || 0);
}
