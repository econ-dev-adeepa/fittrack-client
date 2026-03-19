export default async function awaitable<T>(
  promise: Promise<T>
): Promise<[null, T] | [Error, null]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
}
