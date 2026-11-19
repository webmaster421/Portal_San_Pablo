import type { CollectionConfig } from "payload";
import {
  syncSubcategoryToNestJS,
  deactivateSubcategoryInNestJS,
} from "../sync/nestjs-sync";

export const Subcategories: CollectionConfig = {
  slug: "subcategories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "category", "published", "showOnHome", "order"],
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
      label: "Nombre",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Slug",
      validate: (value: string | null | undefined) => {
        if (!value) {
          return true;
        }
        return (
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
          "El slug solo puede contener letras minúsculas, números y guiones (ejemplo: biblias-infantiles)."
        );
      },
    },
    {
      name: "description",
      type: "textarea",
      required: false,
      label: "Descripción",
    },
    {
      name: "published",
      type: "checkbox",
      required: false,
      defaultValue: true,
      label: "Publicada",
      admin: {
        description: "Indica si la subcategoría está publicada y puede mostrarse.",
      },
    },
    {
      name: "showOnHome",
      type: "checkbox",
      required: false,
      defaultValue: false,
      label: "Mostrar en el home",
      admin: {
        description: "Indica si la subcategoría debe destacarse en la página principal.",
      },
    },
    {
      name: "order",
      type: "number",
      required: false,
      defaultValue: 0,
      label: "Orden",
      admin: {
        description: "Orden de visualización. Menor valor aparece primero.",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
      required: true,
      label: "Categoría principal",
      admin: {
        description: "Categoría principal a la que pertenece esta subcategoría.",
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ operation, doc }) => {
        if (operation === "create" || operation === "update") {
          try {
            const category = doc?.category;
            const categoryPayloadId =
              typeof category === "number"
                ? category
                : typeof category === "object" && category !== null && "id" in category
                  ? (category as { id?: number | string | null }).id ?? null
                  : null;

            const normalizedCategoryPayloadId =
              typeof categoryPayloadId === "number"
                ? categoryPayloadId
                : typeof categoryPayloadId === "string" &&
                    categoryPayloadId.trim() !== "" &&
                    !Number.isNaN(Number(categoryPayloadId))
                  ? Number(categoryPayloadId)
                  : null;

            await syncSubcategoryToNestJS({
              payloadId: doc?.id,
              name: doc?.name,
              slug: doc?.slug,
              description: doc?.description ?? null,
              published: doc?.published ?? true,
              showOnHome: doc?.showOnHome ?? false,
              order: doc?.order ?? 0,
              categoryPayloadId: normalizedCategoryPayloadId,
            });
          } catch (error) {
            console.error(
              `[Payload→NestJS] Error en afterChange de subcategorías (${operation}, subcategoryId=${doc?.id}):`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          await deactivateSubcategoryInNestJS(Number(doc.id));
        } catch (error) {
          console.error(
            `[Payload→NestJS] Error en afterDelete de subcategoría id=${doc?.id}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    ],
  },
};
