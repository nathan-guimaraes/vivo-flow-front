import { ProtocolPriority } from "../protocol.model";

export interface ProtocolAssignDTOLike {
  priority: ProtocolPriority;
  subislandId?: number;
  userId?: number;
}
