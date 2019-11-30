
export const getDeadline= deadline => {
  let time = deadline;
  if (deadline && "seconds" in deadline) time = new Date(time.seconds * 1000); // Epoch
  const countDownDate = new Date(time).getTime();
  return countDownDate - new Date().getTime();
}
export const isReachedDeadline = deadline => getDeadline(deadline) < 0