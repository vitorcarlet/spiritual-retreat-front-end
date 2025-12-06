"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const parentStatus: Record<string, string> = {
  Alive: "Vivo(a)",
  Deceased: "Falecido(a)",
  Unknown: "Desconhecido",
};

type InfoItemProps = {
  label: string;
  value: string;
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

type ParticipantReadOnlyDetailsProps = {
  participant: Participant;
};

const ParticipantReadOnlyDetails: React.FC<ParticipantReadOnlyDetailsProps> = ({
  participant,
}) => {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  const formatBoolean = (val: boolean | undefined) => (val ? "Sim" : "Não");

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Informações Adicionais
      </Typography>

      {/* Dados Pessoais Completos */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Dados Pessoais Completos
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Gênero"
                value={participant.gender === "Male" ? "Masculino" : "Feminino"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Data de Nascimento"
                value={formatDate(participant.birthDate)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem label="Idade" value={`${participant.age} anos`} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Estado Civil"
                value={participant.personal?.maritalStatus ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Tamanho Camiseta"
                value={participant.personal?.shirtSize ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Peso/Altura"
                value={`${participant.personal?.weightKg ?? "-"} kg / ${participant.personal?.heightCm ?? "-"} cm`}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoItem
                label="Endereço"
                value={`${participant.personal?.streetAndNumber ?? ""}, ${participant.personal?.neighborhood ?? ""} - ${participant.personal?.state ?? ""}`}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Contatos */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Contatos Adicionais
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="WhatsApp"
                value={participant.contacts?.whatsapp ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Facebook"
                value={participant.contacts?.facebookUsername ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Instagram"
                value={participant.contacts?.instagramHandle ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Tel. Vizinho"
                value={participant.contacts?.neighborPhone ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Tel. Parente"
                value={participant.contacts?.relativePhone ?? "-"}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Informações Familiares */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Informações Familiares
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Pai"
                value={`${participant.familyInfo?.fatherName ?? "-"} (${parentStatus[participant.familyInfo?.fatherStatus ?? ""] ?? "-"})`}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Mãe"
                value={`${participant.familyInfo?.motherName ?? "-"} (${parentStatus[participant.familyInfo?.motherStatus ?? ""] ?? "-"})`}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Perda familiar (6 meses)"
                value={formatBoolean(
                  participant.familyInfo?.hadFamilyLossLast6Months
                )}
              />
            </Grid>
            {participant.familyInfo?.familyLossDetails && (
              <Grid size={{ xs: 12 }}>
                <InfoItem
                  label="Detalhes da perda"
                  value={participant.familyInfo.familyLossDetails}
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Saúde */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Saúde
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Uso de álcool"
                value={participant.health?.alcoholUse ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Fumante"
                value={formatBoolean(participant.health?.smoker)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Usa drogas"
                value={formatBoolean(participant.health?.usesDrugs)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <InfoItem
                label="Alergias"
                value={formatBoolean(participant.health?.hasAllergies)}
              />
            </Grid>
            {participant.health?.allergiesDetails && (
              <Grid size={{ xs: 12 }}>
                <InfoItem
                  label="Detalhes de alergias"
                  value={participant.health.allergiesDetails}
                />
              </Grid>
            )}
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Restrição médica"
                value={formatBoolean(participant.health?.hasMedicalRestriction)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Toma medicamentos"
                value={formatBoolean(participant.health?.takesMedication)}
              />
            </Grid>
            {participant.health?.medicationsDetails && (
              <Grid size={{ xs: 12 }}>
                <InfoItem
                  label="Medicamentos"
                  value={participant.health.medicationsDetails}
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Família e Retiro */}
      {participant.family && (
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={500}>
              Família no Retiro
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <InfoItem
                  label="Nome da Família"
                  value={participant.family.name}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Cor:
                  </Typography>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: participant.family.color || "#ccc",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Metadados */}
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Metadados
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Data de Inscrição"
                value={formatDate(participant.registrationDate)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Completou Retiro"
                value={formatBoolean(participant.completedRetreat)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <InfoItem
                label="Termos Aceitos"
                value={`${formatBoolean(participant.consents?.termsAccepted)} (v${participant.consents?.termsVersion ?? "-"})`}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};

export default ParticipantReadOnlyDetails;
