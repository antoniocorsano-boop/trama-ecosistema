import { describe, expect, it } from "vitest";
import { reportDataSource, subscribeRuntimeDataState } from "./runtimeState";

describe("runtime data state", () => {
  it("propagates explicit offline-cache provenance", () => {
    let latest: { online: boolean; dataSource: string } | undefined;
    const stop = subscribeRuntimeDataState((state) => {
      latest = state;
    });

    reportDataSource("OFFLINE_CACHE");

    expect(latest?.dataSource).toBe("OFFLINE_CACHE");
    stop();
  });
});
