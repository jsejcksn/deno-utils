import {assertStrictEquals, unimplemented} from './test_deps.ts';
import {createEvent, CustomEventTarget} from './event.ts';

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

Deno.test('CustomEventTarget', async (ctx) => {
  type EventPayloadMap = {
    a: unknown;
    b: undefined;
    c?: undefined;
    d: string;
    e?: number;
    f: { msg: string; };
    g?: { msg: string; };
    x: never;
    adjustCount: 'increment' | 'decrement';
  };

  await ctx.step('emits events', () => {
    const target = new CustomEventTarget<EventPayloadMap>();
    let count = 0;

    target.addEventListener('adjustCount', ({detail}) => {
      if (detail === 'increment') count += 1;
      if (detail === 'decrement') count -= 1;
    });

    const incrementEvent = createEvent('adjustCount', 'increment' as const);
    target.dispatchEvent(incrementEvent);
    target.dispatchEvent(incrementEvent);
    target.dispatch('adjustCount', 'decrement');
    target.dispatch('adjustCount', 'decrement');
    target.dispatch('adjustCount', 'increment');

    assertStrictEquals(count, 1);
  });

  await ctx.step('passes unwritten tests', () => {
    unimplemented();
  });
});
