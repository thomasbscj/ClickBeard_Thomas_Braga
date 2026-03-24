export const parseIntParam = (param: string | string[] | undefined): number => {
  if (!param || Array.isArray(param)) {
    throw new Error("Invalid ID format");
  }
  const id = parseInt(param);
  if (isNaN(id)) {
    throw new Error("Invalid ID");
  }
  return id;
};

export const parseStringParam = (
  param: string | string[] | undefined,
): string => {
  if (!param || Array.isArray(param)) {
    throw new Error("Invalid parameter format");
  }
  return param;
};

export const parsePaginationParams = (
  limit?: any,
  offset?: any,
): { limit: number; offset: number } => {
  const DEFAULT_LIMIT = 10;
  const DEFAULT_OFFSET = 0;
  const MAX_LIMIT = 100;

  let parsedLimit = DEFAULT_LIMIT;
  let parsedOffset = DEFAULT_OFFSET;

  if (limit) {
    const limitStr = Array.isArray(limit)
      ? limit[0]
      : typeof limit === "string"
        ? limit
        : undefined;
    if (limitStr !== undefined && typeof limitStr === "string") {
      const parsedValue = parseInt(limitStr);
      if (!isNaN(parsedValue) && parsedValue > 0) {
        parsedLimit = Math.min(parsedValue, MAX_LIMIT);
      }
    }
  }

  if (offset) {
    const offsetStr = Array.isArray(offset)
      ? offset[0]
      : typeof offset === "string"
        ? offset
        : undefined;
    if (offsetStr !== undefined && typeof offsetStr === "string") {
      const parsedValue = parseInt(offsetStr);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        parsedOffset = parsedValue;
      }
    }
  }

  return { limit: parsedLimit, offset: parsedOffset };
};
