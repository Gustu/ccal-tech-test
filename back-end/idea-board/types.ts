export type Task = {
  id: string;
  title: string;
  description: string;
};

export type BasicIdea = Task & { type: "basic-idea" };

export type ToDo = Task & { type: "todo"; done: boolean };

export type Concept = Task & {
  type: "concept";
  done?: boolean;
  references: string[];
};

export type Idea = BasicIdea | ToDo | Concept;

export type ExtractByType<A, T> = A extends { type: T } ? A : never;