import type { RowDataPacket } from "mysql2";

export type UserTableRow = RowDataPacket & {
  user_id: string;
  user_pw: string;
  user_name: string;
  isAdmin: number;
};
