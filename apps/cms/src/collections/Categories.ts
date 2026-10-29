import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      validate: (value: string | null | undefined) => {
        if (!value) {
          return true;
        }
        return (
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
          "El slug solo puede contener letras minúsculas, números y guiones (ejemplo: zapatillas-running)."
        );
      },
    },
    {
      name: "description",
      type: "textarea",
      required: false,
    },
  ],
};
