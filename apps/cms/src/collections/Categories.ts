import type { CollectionConfig } from "payload";
import {
  syncCategoryToNestJS,
  deactivateCategoryInNestJS,
} from "../sync/nestjs-sync";

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
          "El slug solo puede contener letras minúsculas, números y guiones (ejemplo: teologia)."
        );
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: false,
      label: "Imagen representativa",
      admin: {
        description: "Imagen que se mostrará en la tarjeta de la categoría en el Home.",
      },
    },
    {
      name: "description",
      type: "textarea",
      required: false,
      label: "Descripción",
    },
    {
      name: "active",
      type: "checkbox",
      required: false,
      defaultValue: true,
      label: "Publicada",
      admin: {
        description: "Indica si la categoría está publicada y puede mostrarse.",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      required: false,
      defaultValue: false,
      label: "Mostrar en el Home",
      admin: {
        description: "Indica si la categoría aparecerá en la sección principal del Home.",
      },
    },
    {
      name: "order",
      type: "number",
      required: false,
      defaultValue: 0,
      label: "Orden",
      admin: {
        description: "Orden de aparición en el Home. Menor valor aparece primero.",
      },
    },
  ],
  hooks: {
    // Sincronización unidireccional Payload → NestJS tras crear o actualizar.
    // Los errores se capturan y registran con contexto sin fallar la operación en el CMS.
    afterChange: [
      async ({ operation, data, doc, req }) => {
        if (operation === "create" || operation === "update") {
          try {
            let imageUrl: string | null = null;

            if (data.image) {
              if (
                typeof data.image === "object" &&
                data.image !== null &&
                !Array.isArray(data.image) &&
                "url" in data.image
              ) {
                imageUrl = (data.image as { url?: string }).url ?? null;
              } else {
                try {
                  const media = await req.payload.findByID({
                    collection: "media",
                    id: data.image as number,
                  });
                  const mediaUrl = media.url ?? null;
                  if (mediaUrl) {
                    imageUrl = mediaUrl.startsWith("http")
                      ? mediaUrl
                      : `http://localhost:${process.env.PORT ?? 3001}${mediaUrl}`;
                  }
                } catch {
                  // Si no se puede resolver el medio, se deja imageUrl como null.
                }
              }
            }

            await syncCategoryToNestJS({
              payloadId: doc?.id ?? data.id,
              name: data.name,
              slug: data.slug,
              imageUrl,
              description: data.description ?? null,
              active: data.active ?? true,
              order: data.order ?? 0,
              featured: data.featured ?? false,
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
    // Sincronización de eliminación: desactivar la categoría en NestJS
    // cuando se elimina de Payload, para no dejar información huérfana.
    afterDelete: [
      async ({ doc, req }) => {
        try {
          await deactivateCategoryInNestJS(doc.id);
        } catch (error) {
          console.error(
            `[Payload→NestJS] Error en afterDelete de categoría id=${doc.id}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    ],
  },
};
