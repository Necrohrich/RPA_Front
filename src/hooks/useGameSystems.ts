// src/hooks/useGameSystems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import type {GameSystem, GameSystemFull, Paginated, SchemasDto, ValidationReport} from '@/types'

type UpdateSystemDto = {
    name?: string
    description?: string | null
    is_active?: boolean
}

const systemsApi = {
    // публичный — для селектов в играх/персонажах
    list: () =>
        apiClient.get<GameSystem[]>('/game-systems').then(r => r.data),

    // только свои (creator/moderator/superadmin)
    my: (params: { page: number; page_size: number }) =>
        apiClient.get<Paginated<GameSystem>>('/admin/game-systems/my', { params })
            .then(r => r.data),

    // все (только superadmin)
    all: (params: { page: number; page_size: number }) =>
        apiClient.get<Paginated<GameSystem>>('/admin/game-systems', { params })
            .then(r => r.data),

    create: (dto: { name: string; description?: string | null }) =>
        apiClient.post<GameSystem>('/admin/game-systems', dto).then(r => r.data),

    update: (id: string, dto: UpdateSystemDto) =>
        apiClient.patch<GameSystem>(`/admin/game-systems/${id}`, dto)
            .then(r => r.data),

    remove: (id: string) =>
        apiClient.delete(`/admin/game-systems/${id}`).then(r => r.data),

    getById: (id: string) =>
        apiClient.get<GameSystemFull>(`/admin/game-systems/${id}`).then(r => r.data),

    validateSchemas: (id: string, dto: SchemasDto) =>
        apiClient.post<ValidationReport>(`/admin/game-systems/${id}/schemas/validate`, dto)
            .then(r => r.data),

    saveSchemas: (id: string, dto: SchemasDto) =>
        apiClient.patch<ValidationReport>(`/admin/game-systems/${id}/schemas`, dto)
            .then(r => r.data),

    uploadZip: async (id: string, file: File) => {
        const form = new FormData()
        form.append('file', file)
        const r = await apiClient.post<ValidationReport>(
            `/admin/game-systems/${id}/upload`,
            form,
            {headers: {'Content-Type': 'multipart/form-data'}}
        )
        return r.data
    },

    exportZip: (id: string) =>
        apiClient.get(`/admin/game-systems/${id}/export`, { responseType: 'blob' })
            .then(r => r.data as Blob),

    getSchemas: (id: string) =>
        apiClient.get<SchemasDto>(`/admin/game-systems/${id}/schemas`)
            .then(r => r.data),
}

export const systemKeys = {
    all: ['game-systems'] as const,
    list: () => ['game-systems', 'list'] as const,
    admin: (params: object) => ['game-systems', 'admin', params] as const,
    detail: (id: string) => ['game-systems', 'detail', id] as const,
    schemas: (id: string) => ['game-systems', 'schemas', id] as const,
}

// публичный список — переиспользуется в useCharacters, useGames
export const useGameSystemsList = () =>
    useQuery({
        queryKey: systemKeys.list(),
        queryFn: systemsApi.list,
    })

// список для страницы редактора — my или all в зависимости от роли
export const useAdminGameSystems = (params: { page: number; page_size: number }) => {
    const { user } = useAuth()
    const isSuperadmin = user?.platform_role === 'superadmin'

    return useQuery({
        queryKey: systemKeys.admin(params),
        queryFn: () => isSuperadmin ? systemsApi.all(params) : systemsApi.my(params),
        // не запускаем пока роль неизвестна
        enabled: !!user,
    })
}

export const useCreateGameSystem = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: systemsApi.create,
        onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.all }),
    })
}

export const useUpdateGameSystem = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateSystemDto }) => systemsApi.update(id, dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.all }),
    })
}

export const useDeleteGameSystem = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: systemsApi.remove,
        onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.all }),
    })
}

export const useGameSystemDetail = (id: string) =>
    useQuery({
        queryKey: systemKeys.detail(id),
        queryFn: () => systemsApi.getById(id),
        enabled: !!id,
    })

export const useValidateSchemas = () =>
    useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: SchemasDto }) =>
            systemsApi.validateSchemas(id, dto),
    })

export const useSaveSchemas = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: SchemasDto }) =>
            systemsApi.saveSchemas(id, dto),
        onSuccess: async (_, { id }) => {
            // инвалидируем деталь системы чтобы version/changelog обновились
            await qc.invalidateQueries({ queryKey: systemKeys.detail(id) })
        },
    })
}

export const useUploadZip = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            systemsApi.uploadZip(id, file),
        onSuccess: async (_, { id }) => {
            // после загрузки ZIP перезагружаем систему — схемы изменились
            await qc.invalidateQueries({ queryKey: systemKeys.detail(id) })
        },
    })
}

// экспорт не мутация — триггерится вручную, не через хук
export const exportZip = (id: string) => systemsApi.exportZip(id)

export const useGameSystemSchemas = (id: string) =>
    useQuery({
        queryKey: systemKeys.schemas(id),
        queryFn: () => systemsApi.getSchemas(id),
        enabled: !!id,
    })