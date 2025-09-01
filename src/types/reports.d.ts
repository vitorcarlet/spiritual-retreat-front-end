export interface Report {
  id: string | number;
  name: string;
  sections: string[];
  dateCreation: string; // ISO date string
  period: Period;
  retreatName: string;
  retreatId: string | number;
}

type Period = {
  from: string; // ISO date string
  to: string; // ISO date string
};
