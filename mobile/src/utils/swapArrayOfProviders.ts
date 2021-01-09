/* eslint-disable no-param-reassign */
interface ProviderItem {
  id: string;
  name: string;
  surname: string;
  avatar: string;
}

export default function swapArrayOfProviders(
  swapProviders: ProviderItem[],
  providerId: string,
): ProviderItem[] {
  const swap = swapProviders[0];
  const idx = swapProviders.findIndex((item) => item.id === providerId);
  swapProviders[0] = swapProviders[idx];
  swapProviders[idx] = swap;
  return swapProviders;
}
