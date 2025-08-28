import api from './axios'
import { GROUP_ENDPOINTS } from './endpoints'

export async function fetchMyGroups() {
  const response = await api.get(GROUP_ENDPOINTS.MY_GROUPS)
  return response.data
}
