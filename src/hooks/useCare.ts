/** Hooks de dados (React Query). As telas usam estes hooks, nunca os serviços direto. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentService, caregiverService, medicationService, patientService, prescriptionService, timelineService,
} from "@/services";
import type { CreateNoteInput } from "@/types";

export const queryKeys = {
  patient: (id: string) => ["patient", id] as const,
  caregivers: (patientId: string) => ["caregivers", patientId] as const,
  doses: (patientId: string) => ["doses", patientId] as const,
  timeline: (patientId: string) => ["timeline", patientId] as const,
  appointments: (patientId: string) => ["appointments", patientId] as const,
  prescriptions: (patientId: string) => ["prescriptions", patientId] as const,
};

export function usePatient(id: string) {
  return useQuery({ queryKey: queryKeys.patient(id), queryFn: () => patientService.getById(id) });
}

export function useCaregivers(patientId: string) {
  return useQuery({ queryKey: queryKeys.caregivers(patientId), queryFn: () => caregiverService.listByPatient(patientId) });
}

export function useTodayDoses(patientId: string) {
  return useQuery({ queryKey: queryKeys.doses(patientId), queryFn: () => medicationService.listTodayDoses(patientId) });
}

export function useConfirmDose(patientId: string, confirmedBy: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (doseId: string) => medicationService.confirmDose(doseId, confirmedBy),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.doses(patientId) });
      client.invalidateQueries({ queryKey: queryKeys.timeline(patientId) });
    },
  });
}

export function usePostponeDose(patientId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (doseId: string) => medicationService.postponeDose(doseId, 10),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.doses(patientId) }),
  });
}

export function useTimeline(patientId: string) {
  return useQuery({ queryKey: queryKeys.timeline(patientId), queryFn: () => timelineService.listByPatient(patientId) });
}

export function useCreateNote(patientId: string, authorName: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateNoteInput, "patientId">) => timelineService.createNote({ ...input, patientId }, authorName),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.timeline(patientId) }),
  });
}

export function useAppointments(patientId: string) {
  return useQuery({ queryKey: queryKeys.appointments(patientId), queryFn: () => appointmentService.listByPatient(patientId) });
}

export function usePrescriptions(patientId: string) {
  return useQuery({ queryKey: queryKeys.prescriptions(patientId), queryFn: () => prescriptionService.listByPatient(patientId) });
}
