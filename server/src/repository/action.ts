import puresql, { PuresqlAdapter } from "puresql";
import * as entity from "@App/domain/entity";
import * as db from "@App/domain/db";
import { CreateAction, ActionRepository } from "@App/domain/repository";
import { OkPacket } from "mysql";

const dbActionToEntityAction = (action: db.Action): entity.Action => ({
  id: action.id,
  meetingId: action.meeting_id,
  createdBy: action.created_by,
  ownerId: action.owner_id,
  text: action.text,
  createdAt: action.created_at,
  completed: action.completed === 1,
});

export class SQLRepository implements ActionRepository {
  private adapter: PuresqlAdapter;
  private queries: Record<string, puresql.PuresqlQuery<any>>;

  constructor(
    adapter: PuresqlAdapter,
    queries: Record<string, puresql.PuresqlQuery<any>>
  ) {
    this.adapter = adapter;
    this.queries = queries;
  }
  async createAction(action: CreateAction): Promise<entity.Action> {
    const newActionData = {
      meeting_id: action.meetingId,
      created_by: action.createdBy,
      owner_id: action.ownerId,
      text: action.text,
    };

    const res: OkPacket = await this.queries.create_action(
      newActionData,
      this.adapter
    );

    const actionId = res.insertId;

    return this.getAction(actionId);
  }

  async getAction(actionId: number): Promise<entity.Action> {
    const actions: db.Action[] = await this.queries.get_action(
      { id: actionId },
      this.adapter
    );

    // TODO handle not found

    const action = actions[0];
    return dbActionToEntityAction(action);
  }

  async getActions(meetingId: number): Promise<entity.Action[]> {
    const actions: db.Action[] = await this.queries.get_actions(
      { meeting_id: meetingId },
      this.adapter
    );

    return actions.map(dbActionToEntityAction);
  }
}
