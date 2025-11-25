"use client";
async function initMocks() {
  if (process.env.NEXT_PUBLIC_DISABLE_MSW === "true") {
    return;
  }

  if (typeof window === "undefined") {
    const { server } = await import("./node");
    server.listen({
      onUnhandledRequest: "bypass",
    });
  } else {
    const { worker } = await import("./browser");
    worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

export { initMocks };
