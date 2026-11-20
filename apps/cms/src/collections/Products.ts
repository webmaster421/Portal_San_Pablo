import type { CollectionConfig } from "payload";
import {
  syncProductToNestJS,
  deactivateProductInNestJS,
  mapPayloadProductToSync,
} from "../sync/nestjs-sync";

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
          required: false,
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
          required: false,
          label: "Categoría principal",
          admin: {
            description: "Opcional si el producto tiene al menos una categoría secundaria.",
          },
        },
      ],
      admin: {
        className: "sp-product-fields-row",
      },
    },
    {
      name: "subcategories",
      type: "relationship",
      relationTo: "subcategories",
      hasMany: true,
      required: false,
      label: "Categoría secundaria",
      validate: async (
        value: unknown,
        { data, req }: { data?: { category?: unknown }; req?: { payload?: { findByID: Function } } },
      ) => {
        const hasSelectedValue = (v: unknown): boolean => {
          if (v === null || v === undefined || v === "") return false;
          if (Array.isArray(v)) {
            return v.some((item) => hasSelectedValue(item));
          }
          if (typeof v === "object") {
            const obj = v as { id?: unknown; value?: unknown; relationTo?: unknown };
            const candidate = obj.value ?? obj.id;
            if (candidate !== undefined) {
              return hasSelectedValue(candidate);
            }
            return false;
          }
          return true;
        };

        const extractId = (v: unknown): string | number | null => {
          if (v === null || v === undefined || v === "") return null;
          if (typeof v === "object") {
            const obj = v as { id?: unknown; value?: unknown };
            const candidate = obj.value ?? obj.id;
            return extractId(candidate);
          }
          if (typeof v === "string" || typeof v === "number") return v;
          return null;
        };

        const categoryValue = data?.category;
        const hasCategory = hasSelectedValue(categoryValue);

        const subcategoryItems = Array.isArray(value)
          ? value.filter((item) => hasSelectedValue(item))
          : hasSelectedValue(value)
            ? [value]
            : [];
        const hasSubcategories = subcategoryItems.length > 0;

        if (!hasCategory && !hasSubcategories) {
          return "Debes seleccionar una categoría principal o una categoría secundaria para guardar el producto.";
        }

        if (subcategoryItems.length > 1) {
          return "Selecciona solo una categoría secundaria para este producto.";
        }

        if (hasCategory && hasSubcategories) {
          // Permitir solo si la categoría seleccionada coincide con la categoría
          // principal de la subcategoría (asignación por subcategoría). Esto evita
          // falsos positivos cuando el formulario/autorrelleno mantiene la categoría
          // padre y permite crear productos pertenecientes solo a una subcategoría.
          const subcategoryId = extractId(subcategoryItems[0]);
          const selectedCategoryId = extractId(categoryValue);

          if (subcategoryId !== null && selectedCategoryId !== null && req?.payload?.findByID) {
            try {
              const subcategory = await req.payload.findByID({
                collection: "subcategories",
                id: subcategoryId,
                depth: 0,
              });
              const subcategoryCategoryId = extractId(
                (subcategory as { category?: unknown } | null)?.category,
              );
              if (
                subcategoryCategoryId !== null &&
                String(subcategoryCategoryId) === String(selectedCategoryId)
              ) {
                return true;
              }
            } catch {
              // Si no se puede resolver, aplicar la validación estricta abajo.
            }
          }

          return "Selecciona solo una categoría principal o una categoría secundaria, no ambas.";
        }

        return true;
      },
      admin: {
        description:
          "Opcional. Si asignas una categoría secundaria, el producto aparecerá solo en esa subcategoría (no en la categoría principal ni en otras subcategorías). No combines con categoría principal.",
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
            return value > 0 || "El peso debe ser un número positivo, en gramos.";
          },
          label: "Peso (g)",
          admin: {
            description: "Introduce el peso en gramos.",
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
    afterRead: [
      // Convierte el peso almacenado en kilogramos a gramos para mostrarlo en el admin.
      ({ doc, req }) => {
        if (!doc) return doc;
        if (req?.context?.skipWeightGramConversion) return doc;

        const value = doc.weight;
        if (value === null || value === undefined || value === "") return doc;
        const numeric = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(numeric)) return doc;
        return {
          ...doc,
          weight: numeric * 1000,
        };
      },
    ],
    beforeChange: [
      // Sanitiza marcas de tiempo inválidas antes de guardar.
      // Evita RangeError: Invalid time value al llamar .toISOString() en el admin.
      ({ data }) => {
        const now = new Date().toISOString();
        const isValidDate = (value: unknown): boolean => {
          if (value === null || value === undefined) return false;
          const d = new Date(value as string);
          return !isNaN(d.getTime());
        };
        if (!isValidDate(data.createdAt)) data.createdAt = now;
        if (!isValidDate(data.updatedAt)) data.updatedAt = now;
        return data;
      },

      // Convierte el peso ingresado en gramos (UI) a kilogramos para almacenamiento/sincronización.
      ({ data, originalDoc }) => {
        if (!data) return data;

        if (data.weight === null || data.weight === undefined || data.weight === "") {
          // Si se limpió explícitamente el campo, conservar null; si no vino en update, no tocar.
          if (Object.prototype.hasOwnProperty.call(data, "weight")) {
            data.weight = null;
          }
          return data;
        }

        const weightValue = typeof data.weight === "number" ? data.weight : Number(data.weight);
        if (Number.isFinite(weightValue)) {
          data.weight = weightValue / 1000;
        } else if (originalDoc?.weight !== undefined) {
          data.weight = originalDoc.weight;
        }

        return data;
      },
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

      // Si no se selecciona categoria principal pero si subcategorias, infiere
      // la categoria principal desde la primera subcategoria seleccionada.
      // Esto preserva la relacion subcategoria->categoria y evita el fallo 500
      // por la restriccion NOT NULL de category_id en el esquema SQLite actual del CMS.
      async ({ data, req, originalDoc }) => {
        if (!data) {
          return data;
        }

        const isEmptyValue = (value: unknown): boolean =>
          value === null || value === undefined || value === "";

        const categoryValue = data.category ?? originalDoc?.category;
        const subcategoriesValue =
          data.subcategories !== undefined
            ? data.subcategories
            : originalDoc?.subcategories;

        if (!isEmptyValue(categoryValue)) {
          return data;
        }

        const subcategoryItems = Array.isArray(subcategoriesValue)
          ? subcategoriesValue
          : subcategoriesValue
            ? [subcategoriesValue]
            : [];

        if (subcategoryItems.length === 0) {
          return data;
        }

        const firstSubcategory = subcategoryItems[0];
        const subcategoryId =
          typeof firstSubcategory === "object" && firstSubcategory !== null
            ? (firstSubcategory as { id?: string | number; value?: string | number }).id ??
              (firstSubcategory as { value?: string | number }).value
            : firstSubcategory;

        if (isEmptyValue(subcategoryId)) {
          return data;
        }

        try {
          const subcategory = await req.payload.findByID({
            collection: "subcategories",
            id: subcategoryId as string | number,
            depth: 0,
            req,
          });

          const subcategoryCategory = (subcategory as { category?: unknown } | null)?.category;
          const resolvedCategoryId =
            typeof subcategoryCategory === "object" && subcategoryCategory !== null
              ? (subcategoryCategory as { id?: string | number; value?: string | number }).id ??
                (subcategoryCategory as { value?: string | number }).value
              : subcategoryCategory;

          if (!isEmptyValue(resolvedCategoryId)) {
            data.category = resolvedCategoryId;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          req.payload.logger.error(
            `[Products/beforeChange] No se pudo inferir la categoria desde la subcategoria ${String(subcategoryId)}: ${message}`,
          );
        }

        return data;
      },
    ],
    afterChange: [
      // Sincronización unidireccional Payload → NestJS tras crear o actualizar.
      // - Solo se envían los campos comerciales necesarios.
      // - Se rehidrata el documento con depth para resolver imagen y categoría (IDs → objetos con url/id/nombre).
      // - Los errores de red no fallan la operación en el CMS (se registran con contexto).
      // - No hay ciclo: NestJS no devuelve nada a Payload.
      async ({ operation, doc, req }) => {
        if (operation === "create" || operation === "update") {
          const payloadId = doc?.id;
          try {
            const sourceDoc =
              payloadId !== undefined && payloadId !== null
                ? await req.payload.findByID({
                    collection: "products",
                    id: payloadId,
                    depth: 2,
                    req,
                    context: {
                      ...(req?.context || {}),
                      skipWeightGramConversion: true,
                    },
                  })
                : doc;

            await syncProductToNestJS(mapPayloadProductToSync(sourceDoc));
          } catch (error) {
            console.error(
              `[Payload→NestJS] Error en afterChange (${operation}, payloadId=${payloadId}):`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      },
    ],
    afterDelete: [
      // Desactivación lógica en NestJS cuando un producto se elimina de Payload.
      // - Nunca borra físicamente en PostgreSQL: visible=false y status='draft'.
      // - Los errores se registran con contexto para facilitar depuración.
      async ({ id }) => {
        try {
          await deactivateProductInNestJS(Number(id));
        } catch (error) {
          console.error(
            `[Payload→NestJS] Error en afterDelete (payloadId=${id}):`,
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    ],
  },
};
