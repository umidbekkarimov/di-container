import { AbstractInjectableClass, Container } from "../Container";

it("throws on sync circular dependencies with classes", () => {
  const container = new Container();

  class Foo extends AbstractInjectableClass {
    // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
    public bar = this.container.resolveClass(Bar);
  }

  class Bar extends AbstractInjectableClass {
    public foo = this.container.resolveClass(Foo);
  }

  expect(() => container.resolveClass(Foo)).toThrowErrorMatchingInlineSnapshot(
    `"Container: circular dependency found: Foo -> Bar -> Foo"`
  );

  expect(() => container.resolveClass(Bar)).toThrowErrorMatchingInlineSnapshot(
    `"Container: circular dependency found: Bar -> Foo -> Bar"`
  );
});

it("works with class to class injections", () => {
  const container = new Container();

  class Foo extends AbstractInjectableClass {
    public get bar(): Bar {
      // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
      return this.container.resolveClass(Bar);
    }
  }

  class Bar extends AbstractInjectableClass {
    public get foo(): Foo {
      return this.container.resolveClass(Foo);
    }
  }

  const foo = container.resolveClass(Foo);

  expect(foo).toBeInstanceOf(Foo);
  expect(foo.bar).toBeInstanceOf(Bar);
  expect(foo.bar.foo).toBeInstanceOf(Foo);

  const bar = container.resolveClass(Bar);

  expect(bar).toBeInstanceOf(Bar);
  expect(bar.foo).toBeInstanceOf(Foo);
  expect(bar.foo.bar).toBeInstanceOf(Bar);

  expect(foo.bar).toBe(bar);
  expect(bar.foo).toBe(foo);
});

it("throws on sync circular dependencies with factories", () => {
  const container = new Container();

  interface Foo {
    readonly bar: Bar;
  }

  function createFoo(c: Container): Foo {
    return { bar: c.resolveFactory(createBar) };
  }

  interface Bar {
    readonly foo: Foo;
  }

  function createBar(c: Container): Bar {
    return { foo: c.resolveFactory(createFoo) };
  }

  expect(() =>
    container.resolveFactory(createFoo)
  ).toThrowErrorMatchingInlineSnapshot(
    `"Container: circular dependency found: createFoo -> createBar -> createFoo"`
  );

  expect(() =>
    container.resolveFactory(createBar)
  ).toThrowErrorMatchingInlineSnapshot(
    `"Container: circular dependency found: createBar -> createFoo -> createBar"`
  );
});
