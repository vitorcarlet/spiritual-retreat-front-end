"use client";

import { useMemo } from "react";
import type { MembersById } from "../types";

export interface ValidationError {
  spaceId: string;
  spaceName: string;
  missingCoordinator: boolean;
  missingViceCoordinator: boolean;
  errors: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  errorCount: number;
  hasCoordinatorIssues: boolean;
  hasViceCoordinatorIssues: boolean;
}

const COORDINATOR_ROLE = "Coordinator";
const VICE_COORDINATOR_ROLE = "Vice";

export const useServiceTeamValidation = (
  serviceSpaces: ServiceSpace[],
  membersById: MembersById
): ValidationResult => {
  return useMemo(() => {
    const errors: ValidationError[] = [];

    serviceSpaces.forEach((space) => {
      const spaceName = space.name || String(space.spaceId);
      const spaceErrors: string[] = [];

      // Verificar se existem membros atribuídos
      if (!space.members || space.members.length === 0) {
        spaceErrors.push("Nenhum membro atribuído");
      } else {
        // Verificar coordenador
        const hasCoordinator = space.members.some(
          (member) => member.role === COORDINATOR_ROLE
        );
        if (!hasCoordinator) {
          spaceErrors.push("Coordenador não atribuído");
        }

        // Verificar vice-coordenador
        const hasViceCoordinator = space.members.some(
          (member) => member.role === VICE_COORDINATOR_ROLE
        );
        if (!hasViceCoordinator) {
          spaceErrors.push("Vice-coordenador não atribuído");
        }
      }

      if (spaceErrors.length > 0) {
        errors.push({
          spaceId: String(space.spaceId),
          spaceName,
          missingCoordinator: spaceErrors.some((e) =>
            e.includes("Coordenador")
          ),
          missingViceCoordinator: spaceErrors.some((e) =>
            e.includes("Vice-coordenador")
          ),
          errors: spaceErrors,
        });
      }
    });

    const hasCoordinatorIssues = errors.some((e) => e.missingCoordinator);
    const hasViceCoordinatorIssues = errors.some(
      (e) => e.missingViceCoordinator
    );

    return {
      isValid: errors.length === 0,
      errors,
      errorCount: errors.length,
      hasCoordinatorIssues,
      hasViceCoordinatorIssues,
    };
  }, [serviceSpaces, membersById]);
};
