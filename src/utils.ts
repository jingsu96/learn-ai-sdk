export const isPDF = (path: string) => {
  return /(\.(pdf))/gi.test(path);
};

export const isImage = (path: string) => {
  return /(\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg))/gi.test(path);
};
