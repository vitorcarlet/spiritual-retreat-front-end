"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

import ParticipantForm, {
  ParticipantFormValues,
} from "../no-contemplated/ParticipantForm";
import apiClient from "@/src/lib/axiosClientInstance";

interface ServiceRegistrationDetail {
  id?: string;
  retreatId?: string;
  fullName?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: number;
  city?: string;
  region?: string;
  photoUrl?: string;
  status?: number;
  enabled?: boolean;
  registrationDateUtc?: string;
  preferredSpace?: {
    id?: string;
    name?: string;
  } | null;
}

type ServiceRegistrationFormProps = {
  retreatId: string;
  registrationId: string;
  onSuccess?: () => void;
};

const mapDetailToParticipant = (
  detail: ServiceRegistrationDetail,
  t: ReturnType<typeof useTranslations>
): ContemplatedParticipant => ({
  id: 0,
  name:
    detail.fullName ??
    t("contemplations.service.unassigned.form.fallback-name"),
  email: detail.email ?? "",
  phone: detail.phone ?? undefined,
  status: detail.status === 1 ? "contemplated" : "not_contemplated",
  photoUrl: detail.photoUrl ?? undefined,
  activity:
    detail.preferredSpace?.name ??
    t("contemplations.service.unassigned.form.fallback-activity"),
  paymentStatus: "pending",
  participation: Boolean(detail.enabled),
});

export default function ServiceRegistrationForm({
  retreatId,
  registrationId,
  onSuccess,
}: ServiceRegistrationFormProps) {
  const t = useTranslations();
  const detailRef = useRef<ServiceRegistrationDetail | null>(null);

  const loadParticipant = useCallback(
    async (retreatIdParam: string, participantId: string) => {
      try {
        const { data } = await apiClient.get<ServiceRegistrationDetail>(
          `/api/retreats/${retreatIdParam}/service/registrations/${participantId}`
        );
        detailRef.current = data;
        return mapDetailToParticipant(data, t);
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { message?: string; error?: string })
              ?.message ??
            (error.response?.data as { message?: string; error?: string })
              ?.error ??
            error.message)
          : t("contemplations.service.unassigned.form.fetch-error");

        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 6000,
        });
        return undefined;
      }
    },
    [t]
  );

  const handleSubmit = useCallback(
    async (values: ParticipantFormValues) => {
      const current = detailRef.current;
      if (!current) {
        return;
      }

      const payload = {
        fullName: values.name,
        email: values.email,
        phone: values.phone ?? undefined,
        status: values.status === "contemplated" ? 1 : 0,
        enabled: values.participation,
        photoUrl: values.photoUrl ?? undefined,
        cpf: current.cpf ?? undefined,
        birthDate: current.birthDate ?? undefined,
        gender: current.gender ?? undefined,
        city: current.city ?? undefined,
        region: current.region ?? undefined,
        preferredSpaceId: current.preferredSpace?.id ?? undefined,
      } as Record<string, unknown>;

      try {
        await apiClient.put(
          `/api/retreats/${retreatId}/service/registrations/${registrationId}`,
          payload
        );

        enqueueSnackbar(t("contemplations.service.unassigned.form.success"), {
          variant: "success",
          autoHideDuration: 4000,
        });

        detailRef.current = {
          ...current,
          fullName: values.name,
          email: values.email,
          phone: values.phone ?? current.phone,
          status: values.status === "contemplated" ? 1 : 0,
          enabled: values.participation,
          photoUrl: values.photoUrl ?? current.photoUrl,
        };

        onSuccess?.();
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { message?: string; error?: string })
              ?.message ??
            (error.response?.data as { message?: string; error?: string })
              ?.error ??
            error.message)
          : t("contemplations.service.unassigned.form.error");

        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 6000,
        });

        throw error;
      }
    },
    [retreatId, registrationId, t, onSuccess]
  );

  return (
    <ParticipantForm
      participantId={registrationId}
      retreatId={retreatId}
      onSubmit={handleSubmit}
      loadParticipant={loadParticipant}
      submitLabel={t("contemplations.service.unassigned.form.submit-label")}
    />
  );
}
