import { AbstractInjectableClass, Container } from "../Container";

it("resolves AbstractInjectableClass", () => {
  const container = new Container();

  class Foo extends AbstractInjectableClass {
    public getContainer(): Container {
      return this.container;
    }
  }

  const foo = container.resolveClass(Foo);

  expect(foo).toBeInstanceOf(Foo);
  expect(foo.getContainer()).toBe(container);
});

it("resolves InjectableFactory", () => {
  const container = new Container();

  interface Foo {
    readonly container: Container;
  }

  function createFoo(c: Container): Foo {
    return { container: c };
  }

  const foo = container.resolveFactory(createFoo);

  expect(foo).toBeTruthy();
  expect(foo.container).toBe(container);
});
