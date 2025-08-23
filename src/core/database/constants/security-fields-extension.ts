import { Prisma } from '@prisma/client';
import {
  convertContentToBase64,
  convertContentFromBase64,
} from '@circle-vibe/shared';

import { SENSITIVE_FIELDS_MAP } from './sensitive-fields-map';

type ModelDelegateExtension = any;

export const ENCRIPTION_FIELDS_EXTENSION = Prisma.defineExtension({
  name: 'encryptionExtension',

  model: Object.fromEntries(
    Object.entries(SENSITIVE_FIELDS_MAP).map(([modelName, fields]) => [
      modelName as Prisma.ModelName,
      {
        async create({ args, query }) {
          if (args.data) {
            for (const field of fields!) {
              if (args.data[field]) {
                args.data[field] = convertContentToBase64(args.data[field]);
              }
            }
          }
          const result = await query(args);
          for (const field of fields!) {
            if (result?.[field]) {
              result[field] = convertContentFromBase64(result[field]);
            }
          }
          return result;
        },

        async update({ args, query }) {
          if (args.data) {
            for (const field of fields!) {
              if (args.data[field]) {
                args.data[field] = convertContentToBase64(args.data[field]);
              }
            }
          }
          const result = await query(args);
          for (const field of fields!) {
            if (result?.[field]) {
              result[field] = convertContentFromBase64(result[field]);
            }
          }
          return result;
        },

        async findUnique({ args, query }) {
          const result = await query(args);
          for (const field of fields!) {
            if (result?.[field]) {
              result[field] = convertContentFromBase64(result[field]);
            }
          }
          return result;
        },

        async findMany({ args, query }) {
          const result = await query(args);
          return result.map((record) => {
            for (const field of fields!) {
              if (record?.[field]) {
                record[field] = convertContentFromBase64(record[field]);
              }
            }
            return record;
          });
        },
      },
    ]),
  ) as Partial<Record<Prisma.ModelName, ModelDelegateExtension>>,
});
