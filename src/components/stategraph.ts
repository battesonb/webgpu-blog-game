import {assert} from "../assertions";
import {NodeParams} from "../behaviornodes/behaviornode";
import {Component, UpdateContext} from "../ec/component";

interface EventHandlerDesc {
  name: string,
  callback: EventHandler,
}

type EventHandler = (params: NodeParams) => string | undefined;

function buildEventHandlers(eventHandlerDescriptors: EventHandlerDesc[]): Map<string, EventHandler> {
  const handlers = new Map<string, EventHandler>();
  for (const eventHandler of eventHandlerDescriptors) {
    handlers.set(eventHandler.name, eventHandler.callback);
  }
  return handlers;
}

type StateTag = "jumping";

interface StateDesc {
  name: string,
  tags: StateTag[];
  eventHandlers: EventHandlerDesc[];
  onEnter: (params: NodeParams) => void,
  onExit: (params: NodeParams) => void,
}

interface State {
  tags: StateTag[];
  eventHandlers: Map<string, EventHandler>;
  onEnter: (params: NodeParams) => void,
  onExit: (params: NodeParams) => void,
}

function buildStates(stateDescriptors: StateDesc[]): Map<string, State> {
  const states = new Map<string, State>();
  for (const state of stateDescriptors) {
    states.set(state.name, {
      tags: state.tags,
      eventHandlers: buildEventHandlers(state.eventHandlers),
      onEnter: state.onEnter,
      onExit: state.onExit,
    });
  }
  return states;
}

export class StateGraph extends Component {
  private states: Map<string, State>;
  private eventHandlers: Map<string, EventHandler>;
  private currentStateName: string;
  private bufferedEvents: string[];

  /**
   * The first state is always assumed to be the default.
   */
  constructor(stateDescriptors: StateDesc[], eventHandlerDescriptors: EventHandlerDesc[]) {
    super();
    assert(stateDescriptors.length > 0, "Cannot create a StateGraph without at least one state");
    this.states = buildStates(stateDescriptors);
    this.eventHandlers = buildEventHandlers(eventHandlerDescriptors);
    this.currentStateName = stateDescriptors[0].name;
    this.bufferedEvents = [];
  }

  trigger(event: string) {
    this.bufferedEvents.push(event);
  }

  hasStateTag(tag: StateTag): boolean {
    return this.currentState.tags.includes(tag);
  }

  update(ctx: UpdateContext): void {
    if (this.bufferedEvents.length === 0) {
      return;
    }

    const params = {
      dt: ctx.dt,
      entity: this.entity,
      now: ctx.now,
      world: ctx.world,
    };

    for (const event of this.bufferedEvents) {
      const handler = this.currentState.eventHandlers.get(event) ?? this.eventHandlers.get(event);
      if (!handler) {
        console.warn(`No handler exists on ${this.entity.name} for event '${event}'`);
        continue;
      }
      const nextState = handler(params);
      if (nextState) {
        this.transition(nextState, params);
      }
    }

    this.bufferedEvents = [];
  }

  private get currentState(): State {
    return this.states.get(this.currentStateName)!;
  }

  private transition(nextStateName: string, params: NodeParams) {
    const nextState = this.states.get(nextStateName);
    if (!nextState) {
      console.warn(`No state '${nextStateName}' for ${this.entity.name}`);
      return;
    }
    const lastState = this.currentState;
    lastState.onExit(params);
    this.currentStateName = this.currentStateName;
    nextState.onEnter(params);
  }
}
