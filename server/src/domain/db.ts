export type Meeting = {
  id: number;
  name: string;
  code: string;
  speaker_duration: number;
  created_at: Date;
  auto_proceed: number;
  state: string;
  speaker_queue: string;
};

export type Speaker = {
  id: number;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type Note = {
  id: number;
  meeting_id: number;
  speaker_id: number;
  text: string;
  created_at: Date;
};
