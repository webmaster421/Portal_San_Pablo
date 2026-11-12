import type { CollectionConfig } from "payload";
import { syncBannerToNestJS, deactivateBannerInNestJS } from "../sync/nestjs-sync";

export const Banners: CollectionConfig = {
  slug: "banners",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "active", "order", "updatedAt"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Título",
      admin: {
        description: "Nombre interno del banner.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Imagen",
      admin: {
        description: "Imagen que se mostrará en el carrusel principal.",
      },
    },
    {
      name: "alt",
      type: "text",
      required: false,
      label: "Texto alternativo",
      admin: {
        description: "Texto alternativo de la imagen para accesibilidad.",
      },
    },
    {
      name: "link",
      type: "text",
      required: false,
      label: "Enlace",
      admin: {
        description: "URL de destino al hacer clic en el banner. Opcional.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      required: false,
      defaultValue: true,
      label: "Activo",
      admin: {
        description: "Permite mostrar u ocultar el banner en el frontend.",
      },
    },
    {
      name: "order",
      type: "number",
      required: false,
      defaultValue: 0,
      label: "Orden",
      admin: {
        description: "Orden de aparición. Menor valor aparece primero.",
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ operation, data, doc, req }) => {
        if (operation === "create" || operation === "update") {
          try {
            let imageUrl: string | null = null;

            if (data.image) {
              // data.image puede ser el ID numérico del documento Media o
              // un objeto ya poblado con la propiedad url.
              if (
                typeof data.image === "object" &&
                data.image !== null &&
                !Array.isArray(data.image) &&
                "url" in data.image
              ) {
                imageUrl = (data.image as { url?: string }).url ?? null;
              } else {
                // Es un ID numérico: consultar la colección Media para obtener la URL real.
                try {
                  const media = await req.payload.findByID({
                    collection: "media",
                    id: data.image as number,
                  });
                  const mediaUrl = media.url ?? null;
                  if (mediaUrl) {
                    // Asegurar URL absoluta: si es relativa, construirla con el host y puerto del CMS
                    imageUrl = mediaUrl.startsWith("http")
                      ? mediaUrl
                      : `http://localhost:${process.env.PORT ?? 3001}${mediaUrl}`;
                  }
                } catch {
                  // Si no se puede resolver el medio, se deja imageUrl como null.
                }
              }
            }

            await syncBannerToNestJS({
              payloadId: doc?.id ?? data.id,
              title: data.title,
              imageUrl,
              alt: data.alt ?? null,
              link: data.link ?? null,
              active: data.active ?? true,
              order: data.order ?? 0,
            });
          } catch (error) {
            console.error(
              `[Payload→NestJS] Error en afterChange de banners (${operation}, bannerId=${doc?.id ?? data?.id}):`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      },
    ],
    afterDelete: [
      async ({ id }) => {
        try {
          await deactivateBannerInNestJS(Number(id));
        } catch (error) {
          console.error(
            `[Payload→NestJS] Error en afterDelete de banners (bannerId=${id}):`,
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    ],
  },
};
