import { settlementHandlers } from './handlers/settlementHandlers'
import { tasksHandlers } from './handlers/tasksHandlers'

export const handlers = [...settlementHandlers, ...tasksHandlers]
