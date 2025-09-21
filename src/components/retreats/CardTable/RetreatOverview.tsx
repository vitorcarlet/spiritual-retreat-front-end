"use client";
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import { fetchRetreatData } from "../shared";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const RetreatOverview = ({ retreatId }: { retreatId: string }) => {
  const { setBreadCrumbsTitle } = useBreadCrumbs();
  const t = useTranslations();
  const { data: retreatData, isLoading } = useQuery({
    queryKey: ["retreats", retreatId],
    queryFn: () => fetchRetreatData(retreatId),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (retreatData) {
      setBreadCrumbsTitle({
        title: retreatData.title,
        pathname: `/retreats/${retreatData.id}`,
      });
    }
  }, [retreatData, setBreadCrumbsTitle]);

  const getStatusColor = (
    status: string
  ): "success" | "primary" | "default" => {
    switch (status) {
      case "active":
        return "success";
      case "upcoming":
        return "primary";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const formatCurrency = (value: string | number) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", height: "100%", p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!retreatData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Retiro não encontrado
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Título e Status */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={1}>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                  {retreatData.title}
                </Typography>
                <Chip
                  label={retreatData.status}
                  color={getStatusColor(retreatData.status)}
                  variant="outlined"
                />
              </Box>
              <Typography variant="h6" color="text.secondary">
                {retreatData.edition}ª Edição
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações Básicas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Tema
              </Typography>
              <Typography variant="body1">
                {retreatData.theme || "Não informado"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Instrutor
              </Typography>
              <Typography variant="body1">
                {retreatData.instructor || "Não informado"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Localização */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Local
              </Typography>
              <Typography variant="body1">
                {retreatData.location || "Não informado"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Cidade/Estado
              </Typography>
              <Typography variant="body1">
                {retreatData.city && retreatData.stateShort
                  ? `${retreatData.city} - ${retreatData.stateShort}`
                  : "Não informado"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Descrição */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Descrição
              </Typography>
              <Typography variant="body1">
                {retreatData.description || "Nenhuma descrição disponível"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Datas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Data de Início
              </Typography>
              <Typography variant="body1">
                {formatDate(retreatData.startDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Data de Término
              </Typography>
              <Typography variant="body1">
                {formatDate(retreatData.endDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Capacidade e Inscritos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Capacidade
              </Typography>
              <Typography variant="h6" color="primary">
                {retreatData.capacity} pessoas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Inscritos
              </Typography>
              <Typography variant="h6" color="success.main">
                {retreatData.enrolled} pessoas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {retreatData.capacity > 0
                  ? `${Math.round((retreatData.enrolled / retreatData.capacity) * 100)}% da capacidade`
                  : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de Participação */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Taxa de Participação
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(retreatData.participationTax)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Status de Ativação */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={retreatData.isActive ? "Ativo" : "Inativo"}
                  color={retreatData.isActive ? "success" : "default"}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Imagens */}
        {retreatData.images && retreatData.images.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Imagens do Retiro
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                  {retreatData.images.map(
                    (image: string | { url: string }, index: number) => (
                      <Box
                        key={index}
                        component="img"
                        src={typeof image === "string" ? image : image.url}
                        alt={`Imagem ${index + 1} do retiro`}
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    )
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RetreatOverview;
