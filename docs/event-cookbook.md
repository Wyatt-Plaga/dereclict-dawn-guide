# Event Cookbook: EventBus Usage in Derelict Dawn Guide

This guide provides practical examples for working with the event-driven architecture using the `EventBus`.

---

## 1. Publishing an Event

```ts
import { EventBus } from 'core/EventBus';
const bus = new EventBus();

// Publish a resource change event
bus.publish('resourceChange', {
  state, // GameState
  resourceType: 'energy',
  amount: 10,
  source: 'test',
});
```

---

## 2. Subscribing to an Event

```ts
bus.subscribe('resourceChange', (payload) => {
  console.log('Resource changed:', payload.resourceType, payload.amount);
});
```

---

## 3. Unsubscribing from an Event

```ts
const unsubscribe = bus.subscribe('resourceChange', handler);
// ...later
unsubscribe();
```

---

## 4. Type Safety: Only Valid Events Allowed

```ts
// This will fail to compile if the event key or payload is invalid:
bus.publish('notARealEvent', {}); // ❌ TypeScript error
```

---

## 5. Testing Event Round-Trip (Jest)

```ts
test('resourceChange event triggers subscriber', (done) => {
  const bus = new EventBus();
  bus.subscribe('resourceChange', (data) => {
    expect(data.resourceType).toBe('energy');
    done();
  });
  bus.publish('resourceChange', {
    state: initialGameState,
    resourceType: 'energy',
    amount: 5,
    source: 'test',
  });
});
```

---

## 6. Canonical Event Naming

- Use kebab-case with a colon: `feature:verb` (e.g., `resource:changed`)
- For legacy events, both camelCase and canonical events may be published for compatibility.

---

## 7. Best Practices

- Always type your payloads using the event map.
- Unsubscribe listeners on teardown/hot reload.
- Use the canonical event registry for new events. 