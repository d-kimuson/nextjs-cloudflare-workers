import { format } from "date-fns/format";

export const formatISOWithoutTZ = (date: Date) => {
  return `${format(date, "yyyy-MM-dd")}T${format(date, "HH:mm:ss")}`;
};
