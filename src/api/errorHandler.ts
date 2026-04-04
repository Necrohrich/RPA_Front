// src/api/errorHandler.ts
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

const ERROR_MESSAGES: Record<string, string> = {
    // Auth
    'Invalid credentials':                                      'Неверный логин или пароль',
    'Invalid token':                                            'Сессия недействительна',
    'Token expired':                                            'Сессия истекла',

    // Common
    'Not found':                                                'Объект не найден',
    'Forbidden':                                                'Недостаточно прав',

    // User
    'Login already exists':                                     'Этот логин уже занят',
    'Email already exists':                                     'Этот email уже зарегистрирован',
    'Secondary email cannot be the same as primary':            'Этот email уже используется как основной',
    'Discord already linked':                                   'Discord уже привязан',
    'Secondary Discord ID cannot be the same as primary':       'Этот Discord уже используется как основной',
    'New password must differ from the current one':            'Новый пароль должен отличаться от текущего',
    'Old password is incorrect':                                'Неверный текущий пароль',

    // Game system
    'Game system not found':                                    'Игровая система не найдена',
    'Game system already exists':                               'Игровая система с таким названием уже существует',
    'Game system has dependencies':                             'Нельзя удалить — система используется в играх',
    'Game system schema is not set':                            'Схема игровой системы не установлена',

    // Game
    'Game not found':                                           'Игра не найдена',
    'Game with this name already exists':                       'Игра с таким названием уже существует',
    'Player already in game or request is pending':             'Игрок уже в игре или заявка на рассмотрении',
    'Player not found in this game':                            'Игрок не найден в этой игре',
    'Only the game author can perform this action':             'Только автор игры может это делать',

    // Character
    'Character not found':                                      'Персонаж не найден',
    'Character with this name already exists in the game':      'Персонаж с таким именем уже существует в игре',
    'Character game system does not match the game':            'Игровая система персонажа не совпадает с игрой',
    'Only the character owner can perform this action':         'Только владелец персонажа может это делать',
    'Character game system already set':                        'Игровая система персонажа уже установлена',

    // Game session
    'Game session not found':                                   'Игровая сессия не найдена',
    'Game already has an active session':                       'У игры уже есть активная сессия',
    'Invalid session status transition':                        'Недопустимое изменение статуса сессии',

    // Game review
    'Game review not found':                                    'Отзыв не найден',
    'Player already submitted a review for this session':       'Вы уже оставили отзыв на эту сессию',
    'Review has already been sent and cannot be modified':      'Отзыв уже отправлен и не может быть изменён',
    'User is not allowed to leave a review for this session':   'Вы не можете оставить отзыв на эту сессию',
    'Invalid review status transition':                         'Недопустимое изменение статуса отзыва',

    // Schema loader
    'Unsafe path in archive':                                   'Архив содержит небезопасные пути',
    'File too large':                                           'Файл слишком большой',
    'Circular include detected':                                'Обнаружена циклическая зависимость в схеме',
    'Include file not found':                                   'Файл включения не найден',
    'JSON parse error':                                         'Ошибка парсинга JSON',
    'Schema load error':                                        'Ошибка загрузки схемы',

    // Sheet
    'Sheet validation failed':                                  'Ошибка валидации анкеты',

    // Engine — actions/conditions
    'Condition not found in rules_schema':                      'Условие не найдено в схеме правил',
    'Action not found in actions_schema':                       'Действие не найдено в схеме действий',
    'Insufficient resource to perform action':                  'Недостаточно ресурсов для выполнения действия',

    // Custom pool
    'Custom item not found':                                    'Предмет не найден',
    'Unknown pool_id in game system schema':                    'Неизвестный pool_id в схеме игровой системы',
    'Item already assigned to this character':                  'Предмет уже назначен этому персонажу',

    // Engine — Creation
    'Creation stage not found':                                 'Этап создания не найден',
    'Invalid stage input':                                      'Некорректные данные этапа',
    'Creation wizard already completed':                        'Мастер создания уже завершён',
    'Module not active in this game system':                    'Этот модуль неактивен в данной игровой системе',
    'Creation engine error':                                    'Ошибка движка создания',

    // Engine — Progression
    'Progression not available':                                'Прокачка недоступна',
    'Progression wizard already completed':                     'Мастер прокачки уже завершён',
    'Progression engine error':                                 'Ошибка движка прокачки',
}

// 401 от auth-эндпоинтов обрабатывается в интерцепторе client.ts
// здесь они уже не доходят, поэтому SILENT_CODES пустой
const SILENT_CODES = new Set<number>([])

export const handleAxiosError = (error: AxiosError<{detail: string}>): void => {
    console.log('handleAxiosError called:', error.response?.status, error.response?.data)
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if(!status || SILENT_CODES.has(status)) return

    const message = (detail && ERROR_MESSAGES[detail]) ?? 'Что-то пошло не так'
    toast.error(message)
}