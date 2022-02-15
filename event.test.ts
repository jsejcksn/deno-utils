import {assertStrictEquals} from './test_deps.ts';
import {createEvent} from './event.ts';

Deno.test('createEvent', async (ctx) => {
  await ctx.step('created event has correct property values', () => {
    const eventType = 'name';
    const eventDetail = {string: '', number: NaN};
    const ev = createEvent(eventType, eventDetail);
  
    // type-checking
    ev.type === eventType;
    ev.detail === eventDetail;
  
    assertStrictEquals(ev.type, eventType);
    assertStrictEquals(ev.detail, eventDetail);
  });
});
