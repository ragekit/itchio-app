
import api from './api'

export default {
  get_current_user: () => api.user,
  '@noCallThru': true
}