import { ClassConstructor } from 'class-transformer';
import { ObjectLiteral, Repository } from 'typeorm';
import { PartialMock } from '../types/partial-mock';

export function mockFactory<T>(classToMock: ClassConstructor<T>): PartialMock<T> {
  const serviceMethods = Object.getOwnPropertyNames(classToMock.prototype).filter(
    (prop) => prop !== 'constructor' && typeof classToMock.prototype[prop] === 'function',
  );

  const mock = {} as PartialMock<T>;

  serviceMethods.forEach((method) => {
    mock[method as keyof T] = jest.fn();
  });

  return mock;
}

export function mockRepositoryFactory<T extends ObjectLiteral>(): PartialMock<Repository<T>> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
  };
}
