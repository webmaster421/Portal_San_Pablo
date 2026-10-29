import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    // Almacenamiento local para desarrollo: los archivos se escriben y se
    // sirven desde esta carpeta (relativa al directorio de ejecución del CMS,
    // es decir, apps/cms/).
    // Para migrar después a almacenamiento de objetos (S3): instalar
    // @payloadcms/storage-s3 y configurar el adaptador — requiere una
    // dependencia nueva, pendiente de aprobación.
    staticDir: "uploads/media",
    // Solo imágenes de portada: JPEG, PNG y WebP.
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  admin: {
    useAsTitle: "filename",
    hidden: true,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      required: false,
    },
  ],
};
