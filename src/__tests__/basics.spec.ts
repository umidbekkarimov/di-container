import { AbstractInjectableClass, Container } from "../Container";

interface Foo {
  readonly container: Container;
}

function createFoo(c: Container): Foo {
  return { container: c };
}

interface Bar {
  readonly foo: Foo;
}

function createBar(c: Container): Bar {
  return { foo: c.resolveFactory(createFoo) };
}

class FooClass extends AbstractInjectableClass {}

class BarClass extends AbstractInjectableClass {
  public foo = this.container.resolveClass(FooClass);
}

it("injects values", () => {
  const container = new Container();

  expect(container.has(1)).toBe(false);
  expect(container.inject(1, 2)).toBe(container);
  expect(container.has(1)).toBe(true);

  expect(container.has("FOO")).toBe(false);
  expect(container.inject("FOO", "BAR")).toBe(container);
  expect(container.has("FOO")).toBe(true);

  const foo = createFoo(container);

  expect(container.has(createFoo)).toBe(false);
  expect(container.inject(createFoo, foo)).toBe(container);
  expect(container.has(createFoo)).toBe(true);

  const bar = createBar(container);

  expect(container.has(createBar)).toBe(false);
  expect(container.inject(createBar, bar)).toBe(container);
  expect(container.has(createBar)).toBe(true);

  const fooInstance1 = new FooClass(container);

  expect(container.has(FooClass)).toBe(false);
  expect(container.inject(FooClass, fooInstance1)).toBe(container);
  expect(container.has(FooClass)).toBe(true);

  const barInstance1 = new BarClass(container);

  expect(container.has(BarClass)).toBe(false);
  expect(container.inject(BarClass, barInstance1)).toBe(container);
  expect(container.has(BarClass)).toBe(true);
});

it("resolves injected value", () => {
  const container = new Container();

  expect(container.has(1)).toBe(false);
  expect(container.resolveValue(1)).toBeUndefined();
  expect(container.inject(1, 2)).toBe(container);
  expect(container.has(1)).toBe(true);
  expect(container.resolveValue(1)).toBe(2);

  expect(container.has("FOO")).toBe(false);
  expect(container.resolveValue("FOO")).toBeUndefined();
  expect(container.inject("FOO", "BAR")).toBe(container);
  expect(container.has("FOO")).toBe(true);
  expect(container.resolveValue("FOO")).toBe("BAR");
});

it("resolves AbstractInjectableClass", () => {
  const container = new Container();

  class Foo extends AbstractInjectableClass {}

  class Bar extends AbstractInjectableClass {
    public foo = this.container.resolveClass(Foo);
  }

  const bar = container.resolveClass(Bar);

  expect(container.has(Foo)).toBe(true);
  expect(container.has(Bar)).toBe(true);

  expect(bar).toBeInstanceOf(Bar);
  expect(bar.foo).toBeInstanceOf(Foo);

  const foo = container.resolveClass(Foo);

  expect(foo).toBe(bar.foo);

  expect(container.eject(Foo)).toBe(container);

  expect(container.has(Foo)).toBe(false);

  const foo2 = container.resolveClass(Foo);

  expect(foo2).toBeInstanceOf(Foo);
  expect(foo2).not.toBe(bar.foo);
});

it("resolves InjectableFactory", () => {
  const container = new Container();

  const bar = container.resolveFactory(createBar);

  expect(container.has(createFoo)).toBe(true);
  expect(container.has(createBar)).toBe(true);

  expect(bar).toBeTruthy();
  expect(bar.foo).toBeTruthy();

  const foo = container.resolveFactory(createFoo);

  expect(foo).toBe(bar.foo);

  expect(container.eject(createFoo)).toBe(container);

  expect(container.has(createFoo)).toBe(false);

  const foo2 = container.resolveFactory(createFoo);

  expect(foo2).toBeTruthy();
  expect(foo2).not.toBe(bar.foo);
});
