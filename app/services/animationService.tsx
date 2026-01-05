export const executePin = async (
  address: string,
  pin: number,
  action: string
) => {
  try {
    const response = await fetch(`http://${address}/${pin}/${action}`);
    console.log(response);
  } catch (error) {
    console.error("Error: ", error);
  }
};
