import type { CollectionConfig } from "payload";
import { syncCategoryToNestJS } from "../sync/nestjs-sync";

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
  hooks: {
    afterChange: [
      // Sincronización unidireccional Payload → NestJS tras crear o actualizar.
      // Los errores se capturan y registran con contexto sin fallar la operación en el CMS.
      async ({ operation, data, doc }) => {
        if (operation === "create" || operation === "update") {
          try {
            await syncCategoryToNestJS({
              payloadId: doc?.id ?? data.id,
              name: data.name,
              slug: data.slug,
              description: data.description ?? null,
            });
          } catch (error) {
            console.error(
              `[Payload→NestJS] Error en afterChange de categorías (${operation}, categoryId=${doc?.id ?? data?.id}):`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      },
    ],
  },
};
