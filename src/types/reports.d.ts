export interface Report {
  id: string;
  name: string;
  sections: string[];
  dateCreation: string; // ISO date string
  period: Period;
  retreatName: string;
  retreatId: string;
}

type Period = {
  from: string; // ISO date string
  to: string; // ISO date string
};
