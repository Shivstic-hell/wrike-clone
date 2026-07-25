import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  Workspace,
  Folder,
  Project,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '@wrike-clone/shared';

// ---- Query key factory ----
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: () => [...workspaceKeys.lists()] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  folders: (id: string) => [...workspaceKeys.detail(id), 'folders'] as const,
  projects: (id: string) => [...workspaceKeys.detail(id), 'projects'] as const,
};

export const folderKeys = {
  all: ['folders'] as const,
  tree: (workspaceId: string) => [...folderKeys.all, 'tree', workspaceId] as const,
};

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

// ---- Workspace Hooks ----

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Workspace[] }>('/workspaces');
      return data.data;
    },
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Workspace }>(`/workspaces/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceRequest) => {
      const { data } = await apiClient.post<{ data: Workspace }>('/workspaces', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateWorkspaceRequest & { id: string }) => {
      const { data } = await apiClient.patch<{ data: Workspace }>(
        `/workspaces/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

// ---- Folder Hooks ----

export function useFolderTree(workspaceId: string) {
  return useQuery({
    queryKey: folderKeys.tree(workspaceId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Folder[] }>(
        `/workspaces/${workspaceId}/folders`,
      );
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

// ---- Project Hooks ----

export function useWorkspaceProjects(workspaceId: string) {
  return useQuery({
    queryKey: workspaceKeys.projects(workspaceId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Project[] }>(
        `/workspaces/${workspaceId}/projects`,
      );
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Project }>(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
