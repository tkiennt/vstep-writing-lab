export interface Topic {
  id: string;
  title: string;
  description: string;
  type: string;
}

export interface Essay {
  id: string;
  topicId: string;
  content: string;
  score: number;
  feedback: string;
  createdAt: string;
}
