interface RetreatFamily {
    id: number;
    name: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    membersCount: number;
    createdAt: string;
    updatedAt: string;
    members: Participant[] | null;
}

 