import type { CollectionConfig } from "payload";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    listSearchableFields: ["title", "isbn", "author"],
  },
  access: {
    // Lectura pública solo de productos publicados. Los usuarios
    // autenticados ven todos los estados desde el panel.
    read: ({ req: { user } }) => {
      if (user) {
        return true;
      }
      return { status: { equals: "published" } };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // ─────────────────────────────────────────────────────────────
    // Fila 1: Título + Slug en una misma fila (Row nativo, presentacional).
    // Título ~60% del ancho, Slug ~40%. Labels en español.
    // ─────────────────────────────────────────────────────────────
    {
      type: "row",
      admin: {
        style: { width: "100%" },
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Título",
          admin: {
            width: "60%",
          },
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
          label: "Slug",
          admin: {
            width: "40%",
            description: "Identificador utilizado en la URL del producto.",
          },
        },
      ],
    },

    // Portada: columna izquierda del formulario de dos columnas.
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      displayPreview: true,
      required: false,
      label: "Imagen del producto",
      admin: {
        className: "sp-product-image-field",
        style: { width: "35%" },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Filas compactas del formulario: cada Row es una fila horizontal
    // (presentacional, no altera la estructura de datos).
    // ─────────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "isbn",
          type: "text",
          required: true,
          label: "ISBN",
          admin: {
            description: "Introduce el ISBN del libro.",
          },
        },
        {
          name: "author",
          type: "text",
          required: true,
          label: "Autor",
        },
      ],
      admin: {
        className: "sp-product-fields-row",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "price",
          type: "number",
          required: true,
          validate: (value: number | null | undefined) => {
            if (value === null || value === undefined) {
              return true;
            }
            if (!Number.isInteger(value)) {
              return "El precio debe ser un número entero, sin decimales.";
            }
            return value >= 0 || "El precio no puede ser negativo.";
          },
          label: "Precio (COP)",
          admin: {
            description: "Introduce el precio de venta en pesos colombianos.",
          },
        },
        {
          name: "category",
          type: "relationship",
          relationTo: "categories",
          hasMany: false,
          required: true,
          label: "Categoría",
        },
      ],
      admin: {
        className: "sp-product-fields-row",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "weight",
          type: "number",
          required: false,
          validate: (value: number | null | undefined) => {
            if (value === null || value === undefined) {
              return true;
            }
            return value > 0 || "El peso debe ser un número positivo, en kilogramos.";
          },
          label: "Peso (kg)",
          admin: {
            description: "Introduce el peso en kilogramos.",
          },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "draft",
          options: [
            { label: "Borrador", value: "draft" },
            { label: "Publicado", value: "published" },
          ],
          label: "Estado",
        },
      ],
      admin: {
        className: "sp-product-fields-row",
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Precio y logística: impuestos y flete.
    // - appliesTax / appliesShipping: checkboxes nativos de Payload (guardan boolean).
    // - taxValue: numero con condition nativa (admin.condition) -> solo se muestra
    //   cuando appliesTax esta activado. Su unidad es porcentaje; sin valor por
    //   defecto ni tarifa asignada.
    // ─────────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "appliesTax",
          type: "checkbox",
          required: false,
          defaultValue: false,
          label: "¿Aplica impuesto?",
        },
        {
          name: "taxValue",
          type: "number",
          required: false,
          validate: (value: number | null | undefined) => {
            if (value === null || value === undefined) {
              return true;
            }
            return value >= 0 || "El valor del impuesto no puede ser negativo.";
          },
          label: "Impuesto (%)",
          admin: {
            description: "Porcentaje de impuesto aplicable al producto.",
            condition: (data) => Boolean(data?.appliesTax),
          },
        },
        {
          name: "appliesShipping",
          type: "checkbox",
          required: false,
          defaultValue: false,
          label: "¿Aplica flete?",
        },
      ],
      admin: {
        className: "sp-product-fields-row",
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Dimensiones (Group con nombre: estructura de datos anidada existente).
    // ─────────────────────────────────────────────────────────────
    {
      name: "dimensions",
      type: "group",
      required: false,
      fields: [
        {
          name: "width",
          type: "number",
          required: false,
          label: "Ancho",
        },
        {
          name: "height",
          type: "number",
          required: false,
          label: "Alto",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // Metadatos del libro y flags editoriales / logísticos.
    // - pages: número de páginas del libro (opcional).
    // - keywords: palabras clave para búsquedas en el storefront.
    // - tags: etiquetas del producto.
    // - isNew: indica si el producto es una novedad (badge en la card).
    // - visible: permite ocultar el producto del listado público.
    // - inventory: número de unidades en inventario.
    // ─────────────────────────────────────────────────────────────
    {
      name: "pages",
      type: "number",
      required: false,
      label: "Número de páginas",
      admin: {
        description: "Introduce el número de páginas del libro. Opcional.",
      },
    },
    {
      name: "keywords",
      type: "text",
      hasMany: true,
      required: false,
      label: "Palabras clave",
      admin: {
        description: "Introduce palabras clave para buscar el producto (ej. misterio, aventura).",
      },
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      required: false,
      label: "Etiquetas",
      admin: {
        description: "Introduce etiquetas del producto (ej. bestseller, clásico).",
      },
    },
    {
      name: "isNew",
      type: "checkbox",
      required: false,
      defaultValue: false,
      label: "Novedad",
      admin: {
        description: "Indica si el producto es una novedad; sirve para mostrar una etiqueta en su card.",
      },
    },
    {
      name: "visible",
      type: "checkbox",
      required: false,
      defaultValue: true,
      label: "Visible",
      admin: {
        description: "Permite ocultar el producto del listado público.",
      },
    },
    {
      name: "inventory",
      type: "number",
      required: false,
      validate: (value: number | null | undefined) => {
        if (value === null || value === undefined) {
          return true;
        }
        return (
          Number.isInteger(value) && value >= 0 ||
          "El inventario debe ser un número entero positivo."
        );
      },
      label: "Inventario",
      admin: {
        description: "Introduce el número de unidades en inventario.",
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Descripción: ocupa el ancho completo del formulario.
    // ─────────────────────────────────────────────────────────────
    {
      name: "description",
      type: "richText",
      required: false,
      label: "Descripción",
      admin: {
        className: "sp-product-description-field",
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Generación automática del slug a partir del título.
      // - En creación: si el slug viene vacío, se genera desde el título.
      // - En actualización: nunca se sobrescribe (conserva slugs existentes y ediciones manuales).
      async ({ data, operation }) => {
        if (operation === "create") {
          const slug = data?.slug;
          if (!slug) {
            data.slug = slugify(data?.title ?? "");
          }
        }
        return data;
      },
    ],
  },
};
