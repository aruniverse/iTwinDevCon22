export default {
  manifestPromise: import("../package.json"),
  main: async () => (await import("./index.js")).default(),
};
