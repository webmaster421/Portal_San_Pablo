import type { CollectionConfig } from "payload";

/**
 * Sanitiza marcas de tiempo inválidas antes de guardar.
 * Evita que createdAt/updatedAt con segundos > 59 o valores nulos
 * provoquen RangeError: Invalid time value al llamar .toISOString().
 */
function sanitizeTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();
  const isValidDate = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    const d = new Date(value as string);
    return !isNaN(d.getTime());
  };
  if (!isValidDate(data.createdAt)) data.createdAt = now;
  if (!isValidDate(data.updatedAt)) data.updatedAt = now;
  return data;
}

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  hooks: {
    beforeChange: [
      ({ data }) => sanitizeTimestamps(data as Record<string, unknown>),
    ],
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
