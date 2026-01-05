'use client';
import { useEffect, useState } from 'react';

import { enqueueSnackbar } from 'notistack';

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import apiClient from '@/src/lib/axiosClientInstance';

interface ReportTemplate {
  key: string;
  defaultTitle: string;
  columns: Array<{ key: string; label: string }>;
  summaryKeys: string[];
  supportsPaging: boolean;
  defaultPageLimit: number;
}

interface ReportType {
  value: string;
  label: string;
  columns?: Array<{ key: string; label: string }>;
}

interface EditReportProps {
  report: {
    id: string;
    title: string;
    templateKey?: string;
    defaultParamsJson?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
  isLoading?: boolean;
}

const fetchReportTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    const response = await apiClient.get('/reports/templates');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return [];
  }
};

export default function EditReport({
  report,
  onClose,
  onSuccess,
  isLoading = false,
}: EditReportProps) {
  const [formValues, setFormValues] = useState({
    title: report.title,
    templateKey: report.templateKey || '',
  });

  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const templates = await fetchReportTemplates();
        setReportTemplates(templates);

        // Transform templates into select options
        const options = templates.map((template) => ({
          value: template.key,
          label: template.defaultTitle,
          columns: template.columns,
        }));
        setReportTypes(options);
      } catch (error) {
        console.error('Failed to load report templates:', error);
        enqueueSnackbar('Erro ao carregar tipos de relatório', {
          variant: 'error',
        });
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const getSelectedTemplateColumns = (): Array<{
    key: string;
    label: string;
  }> | null => {
    const selectedTemplate = reportTemplates.find(
      (template) => template.key === formValues.templateKey
    );
    return selectedTemplate?.columns || null;
  };

  const handleSubmit = async () => {
    if (!formValues.title || !formValues.templateKey) {
      enqueueSnackbar('Preencha todos os campos obrigatórios', {
        variant: 'warning',
      });
      return;
    }

    const columns = getSelectedTemplateColumns();
    if (!columns) {
      enqueueSnackbar('Template de relatório inválido', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(`/reports/${report.id}`, {
        id: report.id,
        title: formValues.title,
        templateKey: formValues.templateKey,
        defaultParamsJson: JSON.stringify({ columns }),
      });

      enqueueSnackbar('Relatório atualizado com sucesso!', {
        variant: 'success',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating report:', error);
      enqueueSnackbar('Erro ao atualizar relatório', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = loadingTemplates || isSubmitting || isLoading;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Editar Relatório
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Título do Relatório"
            value={formValues.title}
            onChange={(e) =>
              setFormValues({ ...formValues, title: e.target.value })
            }
            variant="outlined"
            size="small"
            disabled={isDisabled}
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Tipo de Relatório</InputLabel>
            <Select
              value={formValues.templateKey}
              onChange={(e) =>
                setFormValues({ ...formValues, templateKey: e.target.value })
              }
              displayEmpty
              disabled={isDisabled}
              label="Tipo de Relatório"
            >
              <MenuItem value="" disabled>
                {loadingTemplates ? 'Carregando...' : 'Selecione o tipo'}
              </MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={isDisabled}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </Box>
    </Box>
  );
}
