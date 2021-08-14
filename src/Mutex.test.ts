import test from "ava";
import { Mutex } from "./index";

test("Mutex#wait()", async t => {
    t.timeout(1000, "wait took longer than expected.");
    await Mutex.wait(1000 - 10 /* kek */);
    t.pass();
});
