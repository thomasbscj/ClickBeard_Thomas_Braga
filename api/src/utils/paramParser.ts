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
