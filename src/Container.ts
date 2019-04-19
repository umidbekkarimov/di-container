export class AbstractInjectableClass {
  protected container: Container;

  public constructor(container: Container) {
    this.container = container;
  }
}

export interface InjectableClass<
  T extends AbstractInjectableClass = AbstractInjectableClass
> {
  new (container: Container): T;
}

export interface InjectableFactory<T = unknown> {
  (container: Container): T;
}

export type InjectableKey = string | number;

function formatKey(key: InjectableClass | InjectableFactory): string {
  return key.name;
}

export class Container {
  private resolveStack?: Set<InjectableClass | InjectableFactory>;

  protected values: Map<unknown, unknown>;

  public constructor() {
    this.values = new Map();
  }

  public has(
    key: InjectableKey | InjectableClass | InjectableFactory
  ): boolean {
    return this.values.has(key);
  }

  public eject(key: InjectableKey | InjectableClass | InjectableFactory): this {
    this.values.delete(key);

    return this;
  }

  public inject<T>(
    key: T extends AbstractInjectableClass
      ? InjectableClass<T>
      : InjectableKey | InjectableFactory<T>,
    value: T
  ): this {
    this.values.set(key, value);

    return this;
  }

  public resolveValue<T>(key: InjectableKey): T | undefined {
    return this.values.get(key) as T;
  }

  private resolveInjectable<T>(
    key: InjectableClass | InjectableFactory,
    create: () => T
  ): T {
    if (this.values.has(key)) {
      return this.values.get(key) as T;
    }

    const isRootCall = !this.resolveStack;

    if (!this.resolveStack) {
      this.resolveStack = new Set();
    }

    if (this.resolveStack.has(key)) {
      const stack = Array.from(this.resolveStack, formatKey);

      stack.push(formatKey(key));

      this.resolveStack = undefined;

      throw new Error(
        `Container: circular dependency found: ${stack.join(" -> ")}`
      );
    }

    this.resolveStack.add(key);

    const value = create();

    if (isRootCall) {
      this.resolveStack = undefined;
    }

    this.values.set(key, value);

    return value;
  }

  public resolveClass<T extends AbstractInjectableClass>(
    Class: InjectableClass<T>
  ): T {
    return this.resolveInjectable(Class, () => new Class(this));
  }

  public resolveFactory<T>(factory: InjectableFactory<T>): T {
    return this.resolveInjectable(factory, () => factory(this));
  }
}
