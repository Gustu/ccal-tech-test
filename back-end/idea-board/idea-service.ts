import { NotificationService } from "./notification-service";
import { Idea, ExtractByType } from "./types";

/* 
  Task 1. Define types for:
      - `BasicIdea`: Base type, contains `description` and `title` fields.
      - `ToDo`: Similar to `BasicIdea`, contains also `done` field.
      - `Concept`: Similar to `ToDo`, contains optional `done` and `references` fields, `references` is an array of URLs (strings).

  Use these types in other tasks, don't forget about `repository`. Please think of a way how we can easily distinguish idea types.
*/

const triggerMap = {
  todo: ["done"],
  "basic-idea": ["title"],
  concept: ["references"],
};

export class IdeaService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly repository: Idea[]
  ) {}

  /*
    Task 2. Implement `create` method, it should accept all idea types and return the corresponding, concrete type. Use `repository` to store the input.
  */
  async create<T extends Idea>(idea: T): Promise<T> {
    this.repository.push(idea);
    return idea;
  }

  /* 
    Task 3. Implement `update` method, it should accept update for all idea types. Bonus points if it accepts partial update.
    
    Additionally, we must ensure that if `title` in `BasicIdea`, `done` in `ToDo` or `references` in `Concept` are changed we call the Notification service.
    
    Please bear in mind that in the future we may need to notify about other fields update as well.
    We need to ensure that we won't forget about any new fields added in the future.
    
    Use `repository` to store the update and `notificationService` to notify about the update.
  */
  async update<T extends Idea>(
    update: Partial<T> & { id: string; type: Idea["type"] }
  ): Promise<void> {
    const index = this.repository.findIndex(
      (row) => row.id === update.id && row.type === update.type
    );

    const { id, type, ...toUpdate } = update;

    if (index !== -1) {
      const triggers = triggerMap[this.repository[index].type];
      const actions = triggers.map(async (trigger) => {
        if (update.hasOwnProperty(trigger)) {
          await this.notificationService.notify({
            id: update.id,
            fieldName: trigger,
          });
        }
      });

      await Promise.all(actions);

      this.repository[index] = {
        ...this.repository[index],
        ...toUpdate,
      };
    }
  }

  /*
    Task 4. Implement `getAllByType` method, it accepts idea type and returns an array of the corresponding, concrete types.
    
    Use `repository` to fetch ideas.
  */
  async getAllByType<K extends Idea["type"]>(
    type: K
  ): Promise<ExtractByType<Idea, K>[]> {
    return this.repository.filter(
      (row): row is ExtractByType<Idea, K> => row.type === type
    );
  }
}

/*
  Task 5. Write unit tests for `IdeaService` class. For simplicity don't bother with `repository`.
*/
