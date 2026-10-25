export function createEmbeddingIntentPort() {
  return Object.freeze({
    mode: 'local',
    async resolve() {
      return [];
    },
    async discover() {
      return [];
    },
  });
}
