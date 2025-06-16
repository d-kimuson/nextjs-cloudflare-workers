export const { getCurrentDate, fixDate, resetDate } = (() => {
  let fixedDate: null | Date = null;

  const fixDate = (date: Date) => {
    fixedDate = date;
  };

  const getCurrentDate = () => {
    return fixedDate ?? new Date();
  };

  const resetDate = () => {
    fixedDate = null;
  };

  return {
    fixDate,
    getCurrentDate,
    resetDate,
  };
})();
