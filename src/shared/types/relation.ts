// SWC emits `design:type` by reading the imported class, which throws while models import each
// other. Wrapping the type makes SWC emit Object; relation decorators already carry the real class.
export type Relation<T> = T;
