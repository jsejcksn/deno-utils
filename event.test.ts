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
  };

  type CountMap = { adjustCount: 'increment' | 'decrement'; };

  await ctx.step('dispatches events', () => {
    const target = new CustomEventTarget<CountMap>();
    let count = 0;

    target.addEventListener('adjustCount', ({detail}) => {
      count += detail === 'increment' ? 1 : -1;
    });

    const incrementEvent = createEvent('adjustCount', 'increment' as const);
    target.dispatchEvent(incrementEvent);
    target.dispatchEvent(incrementEvent);
    target.dispatch('adjustCount', 'decrement');
    target.dispatch('adjustCount', 'decrement');
    target.dispatch('adjustCount', 'increment');

    assertStrictEquals(count, 1);
  });

  await ctx.step('correctly implements "once" option', () => {
    const target = new CustomEventTarget<CountMap>();
    let count = 0;

    const cb = (ev: CustomEvent<CountMap['adjustCount']>) => {
      count += ev.detail === 'increment' ? 1 : -1;
    };

    target.addEventListener('adjustCount', cb, {once: true});
    const incrementEvent = createEvent('adjustCount', 'increment' as const);

    assertStrictEquals(count, 0);
    target.dispatchEvent(incrementEvent);
    assertStrictEquals(count, 1);
    target.dispatchEvent(incrementEvent);
    assertStrictEquals(count, 1);
  });

  await ctx.step('"subscribe" method returns "unsubscribe" function', () => {
    const target = new CustomEventTarget<CountMap>();
    let count = 0;

    const unsubscribe = target.subscribe('adjustCount', payload => {
      count += payload === 'increment' ? 1 : -1;
      unsubscribe();
    });

    assertStrictEquals(count, 0);
    target.publish('adjustCount', 'increment');
    assertStrictEquals(count, 1);
    target.publish('adjustCount', 'increment');
    assertStrictEquals(count, 1);
  });

  await ctx.step('test coverage is adequate', () => {
    unimplemented();
  });
});
