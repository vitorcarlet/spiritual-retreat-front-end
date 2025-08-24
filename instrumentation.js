export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" &&
    process.env.APP_ENV === "test"
  ) {
    const { server } = await import("@/src/mocks/node");
    server.listen();
  }
}

// Now you have full control to intercept and mock out everything you need in your app! But one more change to the `instrumentation.js` file is needed, as when you deploy you will not want to use mock data but instead real data.

// After looking into this, I learnt that the best way is to use an additional environment variable `APP_ENV` and add it to the condition in the `intrumentation.js` file, resulting in:

// export async function register() {
//   if (process.env.NEXT_RUNTIME === "nodejs" && process.env.APP_ENV === "test") {
//     const { mockServer } = await import("./mocks/node");
//     mockServer.listen();
//   }
// }
export async function unregister() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_API_MOCKING === "enabled" &&
    process.env.APP_ENV === "test"
  ) {
    const { server } = await import("@/src/mocks/node");
    server.close();
  }
}
