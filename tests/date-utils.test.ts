import * as assert from "node:assert/strict";
import { computeAttendingCount, getCountdown } from "../lib/date";

assert.equal(computeAttendingCount("ne_dolazi", ["A"]), 0);
assert.equal(computeAttendingCount("dolazi", ["A", "B"]), 3);
assert.equal(getCountdown("2000-01-01").expired, true);

console.log("date-utils tests passed");