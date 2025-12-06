"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import ParticipantPublicFormTab from "../ParticipantPublicFormTab";

type ParticipantFormTabViewProps = {
  retreatId: string;
  participantId: string;
  participant: Participant;
};

const ParticipantFormTabView: React.FC<ParticipantFormTabViewProps> = ({
  retreatId,
  participantId,
  participant,
}) => {
  return (
    <Box sx={{ py: 2 }}>
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2, bgcolor: "background.default" }}
      >
        <Typography variant="body2" color="text.secondary">
          Visualize e edite as respostas do formulário de inscrição do
          participante.
        </Typography>
      </Paper>
      <ParticipantPublicFormTab
        retreatId={retreatId}
        participantId={participantId}
        initialData={participant}
      />
    </Box>
  );
};

export default ParticipantFormTabView;
