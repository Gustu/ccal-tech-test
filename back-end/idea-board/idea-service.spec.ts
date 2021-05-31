import { IdeaService } from "./idea-service";
import { NotificationService } from "./notification-service";
import { Idea } from "./types";

describe("Idea service", function () {
  const notificationService: NotificationService = {
    notify: async () => {},
  };

  it("should create basic idea", async () => {
    // given
    const ideaService = new IdeaService(notificationService, []);
    const ideasBefore = await ideaService.getAllByType("basic-idea");

    // when
    const idea = await ideaService.create({
      id: "1",
      type: "basic-idea",
      title: "Title",
      description: "Description",
    });

    // then
    const ideasAfter = await ideaService.getAllByType("basic-idea");
    expect(ideasBefore).toHaveLength(0);
    expect(ideasAfter).toHaveLength(1);
  });

  it("should create concept idea", async () => {
    // given
    const ideaService = new IdeaService(notificationService, []);
    const ideasBefore = await ideaService.getAllByType("concept");

    // when
    const idea = await ideaService.create({
      id: "1",
      type: "concept",
      title: "Title",
      description: "Description",
      references: ["https://google.com"],
    });
    const idea2 = await ideaService.create({
      id: "1",
      type: "concept",
      title: "Title2",
      description: "Description",
      done: true,
      references: ["https://google.com"],
    });

    // then
    const ideasAfter = await ideaService.getAllByType("concept");
    expect(ideasBefore).toHaveLength(0);
    expect(ideasAfter).toHaveLength(2);
  });

  it("should create todo idea", async () => {
    // given
    const ideaService = new IdeaService(notificationService, []);
    const ideasBefore = await ideaService.getAllByType("todo");

    // when
    const idea = await ideaService.create({
      id: "1",
      type: "todo",
      title: "Title",
      description: "Description",
      done: true,
    });

    // then
    const ideasAfter = await ideaService.getAllByType("todo");
    expect(ideasBefore).toHaveLength(0);
    expect(ideasAfter).toHaveLength(1);
  });

  it("should not find any idea when repo is empty", async () => {
    // given
    const ideaService = new IdeaService(notificationService, []);

    // when
    const todos = await ideaService.getAllByType("todo");
    const concepts = await ideaService.getAllByType("concept");
    const basicIdeas = await ideaService.getAllByType("basic-idea");

    // then

    expect(todos).toHaveLength(0);
    expect(concepts).toHaveLength(0);
    expect(basicIdeas).toHaveLength(0);
  });

  it("should find basic ideas", async () => {
    // given
    const ideaService = new IdeaService(notificationService, [
      {
        id: "1",
        type: "basic-idea",
        title: "Title",
        description: "Description",
      },
    ]);

    // when
    const todos = await ideaService.getAllByType("todo");
    const concepts = await ideaService.getAllByType("concept");
    const basicIdeas = await ideaService.getAllByType("basic-idea");

    // then

    expect(todos).toHaveLength(0);
    expect(concepts).toHaveLength(0);
    expect(basicIdeas).toHaveLength(1);
  });

  it("should find conceppt", async () => {
    // given
    const ideaService = new IdeaService(notificationService, [
      {
        id: "1",
        type: "concept",
        title: "Title2",
        description: "Description",
        done: true,
        references: ["https://google.com"],
      },
    ]);

    // when
    const todos = await ideaService.getAllByType("todo");
    const concepts = await ideaService.getAllByType("concept");
    const basicIdeas = await ideaService.getAllByType("basic-idea");

    // then

    expect(todos).toHaveLength(0);
    expect(concepts).toHaveLength(1);
    expect(basicIdeas).toHaveLength(0);
  });

  it("should find todo", async () => {
    // given
    const ideaService = new IdeaService(notificationService, [
      {
        id: "1",
        type: "todo",
        title: "Title",
        description: "Description",
        done: true,
      },
    ]);

    // when
    const todos = await ideaService.getAllByType("todo");
    const concepts = await ideaService.getAllByType("concept");
    const basicIdeas = await ideaService.getAllByType("basic-idea");

    // then

    expect(todos).toHaveLength(1);
    expect(concepts).toHaveLength(0);
    expect(basicIdeas).toHaveLength(0);
  });

  it("should update idea", async () => {
    // given
    const ideaService = new IdeaService(notificationService, [
      {
        id: "1",
        type: "todo",
        title: "Title",
        description: "Description",
        done: true,
      },
    ]);

    // when
    await ideaService.update({ id: "1", type: "todo", title: "Title2" });

    // then
    const todos = await ideaService.getAllByType("todo");
    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe("Title2");
  });

  it("should not update idea", async () => {
    // given
    const ideaService = new IdeaService(notificationService, [
      {
        id: "1",
        type: "todo",
        title: "Title",
        description: "Description",
        done: true,
      },
    ]);

    // when
    await ideaService.update({ id: "2", type: "todo", title: "Title2" });
    await ideaService.update({ id: "1", type: "concept", title: "Title2" });
    await ideaService.update({ id: "1", type: "basic-idea", title: "Title2" });

    // then
    const todos = await ideaService.getAllByType("todo");
    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe("Title");
  });

  it("should notify about changes", async () => {
    // given
    const notifications: { id: string; fieldName: string }[] = [];
    const notificationService: NotificationService = {
      notify: async (payload) => {
        notifications.push(payload);
      },
    };
    const ideas: Idea[] = [
      {
        id: "1",
        type: "basic-idea",
        title: "Title",
        description: "Description",
      },
      {
        id: "3",
        type: "concept",
        title: "Title",
        description: "Description",
        done: true,
        references: [],
      },
      {
        id: "2",
        type: "todo",
        title: "Title",
        description: "Description",
        done: false,
      },
    ];
    const ideaService = new IdeaService(notificationService, ideas);

    // when
    await ideaService.update({ id: "1", type: "basic-idea", title: "Title2" });
    await ideaService.update({ id: "2", type: "todo", done: false });
    await ideaService.update({
      id: "3",
      type: "concept",
      references: ["https://google.com"],
    });

    // then
    expect(notifications).toHaveLength(3);
  });
});
