<template>
  <div class="teacher-groups">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <main class="teacher-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка данных...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">
            <i class="fas fa-times-circle"></i>
          </p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="loadData" class="btn btn-primary">Повторить</button>
        </div>

        <template v-else>
          <div class="teacher-header">
            <div>
              <h1 class="teacher-title">Группы и студенты</h1>
              <p class="teacher-subtitle">Управляйте учебными группами</p>
            </div>
            <button @click="createGroup" class="btn btn-primary">
              + Создать группу
            </button>
          </div>

          <!-- Табы: Группы / Все студенты -->
          <div class="groups-tabs">
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'groups' }"
                @click="activeTab = 'groups'"
            >
              Группы
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'students' }"
                @click="activeTab = 'students'"
            >
              Все студенты
            </button>
          </div>

          <!-- Вкладка с группами -->
          <div v-if="activeTab === 'groups'" class="groups-tab">
            <div v-if="groups.length === 0" class="empty-state">
              <p class="empty-icon">👥</p>
              <h3>Нет групп</h3>
              <p>Создайте первую группу</p>
              <button @click="createGroup" class="btn btn-primary">
                Создать группу
              </button>
            </div>
            <div v-else class="groups-grid">
              <div v-for="group in groups" :key="group.id" class="group-card">
                <div class="group-header">
                  <h3 class="group-name">{{ group.name }}</h3>
                  <div class="group-actions">
                    <button @click="editGroup(group.id)" class="icon-btn" title="Редактировать">✎</button>
                    <button @click="deleteGroup(group.id)" class="icon-btn delete" title="Удалить">✕</button>
                  </div>
                </div>

                <p class="group-description">{{ group.description || 'Нет описания' }}</p>

                <div class="group-stats">
                  <span class="stat">
                    <strong>{{ group.students?.length || 0 }}</strong> студентов
                  </span>
                  <span class="stat">
                    <strong>{{ group.testsAssigned || 0 }}</strong> тестов
                  </span>
                </div>

                <div class="group-students">
                  <div v-for="student in group.students?.slice(0, 3)" :key="student.id" class="student-chip">
                    {{ student.name }}
                  </div>
                  <span v-if="group.students?.length > 3" class="more-students">
                    +{{ group.students.length - 3 }}
                  </span>
                </div>

              </div>
            </div>
          </div>

          <!-- Вкладка со всеми студентами -->
          <div v-if="activeTab === 'students'" class="students-tab">
            <div class="students-filters">
              <div class="search-wrapper">
                <input
                    type="text"
                    v-model="studentSearch"
                    placeholder="Поиск по имени или email..."
                    class="search-input"
                />
                <span class="search-icon">🔍</span>
              </div>

              <select v-model="groupFilter" class="filter-select">
                <option value="all">Все группы</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>

            <div v-if="filteredStudents.length === 0" class="empty-state">
              <p>Студенты не найдены</p>
            </div>
            <table v-else class="students-table">
              <thead>
              <tr>
                <th>Студент</th>
                <th>Email</th>
                <th>Группа</th>
                <th>Тестов пройдено</th>
                <th>Средний балл</th>
                <th>Последняя активность</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="student in filteredStudents" :key="student.id">
                <td>
                  <div class="student-info">
                    <div class="student-avatar">{{ student.initials }}</div>
                    {{ student.name }}
                  </div>
                </td>
                <td>{{ student.email }}</td>
                <td>{{ student.groupName || 'Без группы' }}</td>
                <td>{{ student.testsPassed || 0 }}</td>
                <td>
                  <span class="score-badge" :class="getScoreClass(student.avgScore)">
                    {{ student.avgScore || 0 }}%
                  </span>
                </td>
                <td>{{ formatDate(student.lastActive) }}</td>
                <td>
                  <button @click="viewStudentProfile(student.id)" class="btn-link-small">
                    Профиль
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </main>

    <!-- Модальное окно создания/редактирования группы -->
    <div v-if="showGroupModal" class="modal-overlay" @click.self="showGroupModal = false">
      <div class="modal">
        <h2 class="modal-title">{{ editingGroup ? 'Редактировать группу' : 'Создать группу' }}</h2>

        <form @submit.prevent="saveGroup" class="group-form">
          <div class="form-group">
            <label for="group-name">Название группы</label>
            <input
                type="text"
                id="group-name"
                v-model="groupForm.name"
                class="form-input"
                required
            />
          </div>

          <div class="form-group">
            <label for="group-description">Описание</label>
            <textarea
                id="group-description"
                v-model="groupForm.description"
                rows="3"
                class="form-input"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Добавить студентов</label>
            <div class="student-selector">
              <input
                  type="text"
                  v-model="studentSearchInput"
                  placeholder="Поиск студентов..."
                  class="form-input"
              />
              <div v-if="availableStudents.length === 0" class="empty-list">
                Нет доступных студентов
              </div>
              <div v-else class="students-list">
                <label v-for="student in availableStudents" :key="student.id" class="student-checkbox">
                  <input
                      type="checkbox"
                      :value="student.id"
                      v-model="groupForm.students"
                  />
                  <span>{{ student.name }} ({{ student.email }})</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button type="button" @click="showGroupModal = false" class="btn btn-outline">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Футер -->
    <app-footer></app-footer>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import AppNavigation from '../components/navigation'
import AppFooter from '../components/footer'

export default {
  name: 'TeacherGroups',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      activeTab: 'groups',
      showGroupModal: false,
      editingGroup: false,
      editingGroupId: null,
      studentSearch: '',
      groupFilter: 'all',
      studentSearchInput: '',
      loading: true,
      saving: false,
      error: null,

      // Данные из Supabase
      groups: [],
      allStudents: [],
      professors: [],

      // Форма группы
      groupForm: {
        name: '',
        description: '',
        students: []
      }
    }
  },
  computed: {
    filteredStudents() {
      let filtered = this.allStudents

      if (this.studentSearch) {
        const query = this.studentSearch.toLowerCase()
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query)
        )
      }

      if (this.groupFilter !== 'all') {
        const group = this.groups.find(g => g.id === this.groupFilter)
        if (group) {
          filtered = filtered.filter(s => s.groupId === group.id)
        }
      }

      return filtered
    },

    availableStudents() {
      let students = this.allStudents

      if (this.studentSearchInput) {
        const query = this.studentSearchInput.toLowerCase()
        students = students.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query)
        )
      }

      // Сортируем: сначала не в группе, потом в группе
      return students.sort((a, b) => {
        if (a.groupId && !b.groupId) return 1
        if (!a.groupId && b.groupId) return -1
        return 0
      })
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      this.error = null

      try {
        // Получаем текущего пользователя (преподавателя)
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) {
          this.$router.push('/login')
          return
        }

        // Загружаем группы преподавателя
        await this.loadGroups()

        // Загружаем всех студентов
        await this.loadStudents()

      } catch (error) {
        console.error('Error loading data:', error)
        this.error = error.message || 'Не удалось загрузить данные'
      } finally {
        this.loading = false
      }
    },

    async loadGroups() {
      try {
        const { data: groupsData, error: groupsError } = await supabase
            .from('groups')
            .select(`
              id,
              name,
              description,
              created_at,
              user_groups (
                user_id,
                profiles:user_id (
                  id,
                  first_name,
                  last_name,
                  email
                )
              )
            `)
            .order('created_at', { ascending: false })

        if (groupsError) throw groupsError

        // Форматируем группы
        this.groups = (groupsData || []).map(group => {
          const students = (group.user_groups || [])
              .filter(ug => ug.profiles)
              .map(ug => ({
                id: ug.profiles.id,
                name: `${ug.profiles.first_name || ''} ${ug.profiles.last_name || ''}`.trim() || 'Студент',
                email: ug.profiles.email,
                initials: this.getInitials(ug.profiles.first_name, ug.profiles.last_name)
              }))

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            students,
            testsAssigned: Math.floor(Math.random() * 10) + 1 // Заглушка, нужно будет добавить реальный подсчет
          }
        })

      } catch (error) {
        console.error('Error loading groups:', error)
        this.groups = []
      }
    },

    async loadStudents() {
      try {
        // Загружаем всех студентов (пользователей с ролью 'student')
        const { data: studentsData, error: studentsError } = await supabase
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name,
              email,
              group_name,
              user_groups (
                group_id,
                groups (
                  id,
                  name
                )
              )
            `)
            .eq('role', 'student')
            .order('last_name', { ascending: true })

        if (studentsError) throw studentsError

        // Для каждого студента получаем статистику
        this.allStudents = await Promise.all((studentsData || []).map(async (student) => {
          // Получаем попытки студента
          const { data: attempts, error: attemptsError } = await supabase
              .from('attempts')
              .select('score, completed_at')
              .eq('user_id', student.id)
              .eq('status', 'completed')
              .order('completed_at', { ascending: false })

          if (attemptsError) {
            console.error('Error loading attempts:', attemptsError)
          }

          const testsPassed = attempts?.length || 0
          const avgScore = testsPassed > 0
              ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / testsPassed)
              : 0

          const lastActive = attempts?.[0]?.completed_at

          // Определяем текущую группу студента
          const currentGroup = student.user_groups?.[0]?.groups

          return {
            id: student.id,
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Студент',
            initials: this.getInitials(student.first_name, student.last_name),
            email: student.email,
            groupName: currentGroup?.name || student.group_name || 'Без группы',
            groupId: currentGroup?.id || null,
            testsPassed,
            avgScore,
            lastActive
          }
        }))

      } catch (error) {
        console.error('Error loading students:', error)
        this.allStudents = []
      }
    },

    getInitials(firstName, lastName) {
      if (firstName && lastName) {
        return (firstName[0] + lastName[0]).toUpperCase()
      }
      if (firstName) return firstName[0].toUpperCase()
      if (lastName) return lastName[0].toUpperCase()
      return '?'
    },

    createGroup() {
      this.editingGroup = false
      this.editingGroupId = null
      this.groupForm = {
        name: '',
        description: '',
        students: []
      }
      this.studentSearchInput = ''
      this.showGroupModal = true
    },

    editGroup(id) {
      const group = this.groups.find(g => g.id === id)
      if (group) {
        this.editingGroup = true
        this.editingGroupId = id
        this.groupForm = {
          name: group.name,
          description: group.description || '',
          students: group.students.map(s => s.id)
        }
        this.showGroupModal = true
      }
    },

    async deleteGroup(id) {
      if (!confirm('Удалить группу? Все студенты будут удалены из группы.')) return

      try {
        // Удаляем связи студентов с группой
        const { error: userGroupsError } = await supabase
            .from('user_groups')
            .delete()
            .eq('group_id', id)

        if (userGroupsError) throw userGroupsError

        // Удаляем саму группу
        const { error: groupError } = await supabase
            .from('groups')
            .delete()
            .eq('id', id)

        if (groupError) throw groupError

        // Обновляем список групп
        await this.loadGroups()

      } catch (error) {
        console.error('Error deleting group:', error)
        alert('Ошибка при удалении группы')
      }
    },

    async saveGroup() {
      if (!this.groupForm.name) {
        alert('Введите название группы')
        return
      }

      this.saving = true

      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (this.editingGroup) {
          // Обновляем существующую группу
          const { error: groupError } = await supabase
              .from('groups')
              .update({
                name: this.groupForm.name,
                description: this.groupForm.description,
                updated_at: new Date().toISOString()
              })
              .eq('id', this.editingGroupId)

          if (groupError) throw groupError

          // Удаляем старые связи
          const { error: deleteError } = await supabase
              .from('user_groups')
              .delete()
              .eq('group_id', this.editingGroupId)

          if (deleteError) throw deleteError

          // Добавляем новые связи
          if (this.groupForm.students.length > 0) {
            const userGroups = this.groupForm.students.map(studentId => ({
              user_id: studentId,
              group_id: this.editingGroupId
            }))

            const { error: insertError } = await supabase
                .from('user_groups')
                .insert(userGroups)

            if (insertError) throw insertError
          }

        } else {
          // Создаем новую группу
          const { data: newGroup, error: groupError } = await supabase
              .from('groups')
              .insert([{
                name: this.groupForm.name,
                description: this.groupForm.description,
                created_by: user.id
              }])
              .select()
              .single()

          if (groupError) throw groupError

          // Добавляем студентов в группу
          if (this.groupForm.students.length > 0) {
            const userGroups = this.groupForm.students.map(studentId => ({
              user_id: studentId,
              group_id: newGroup.id
            }))

            const { error: insertError } = await supabase
                .from('user_groups')
                .insert(userGroups)

            if (insertError) throw insertError
          }
        }

        // Обновляем данные
        await this.loadGroups()
        await this.loadStudents()

        this.showGroupModal = false

      } catch (error) {
        console.error('Error saving group:', error)
        alert('Ошибка при сохранении группы')
      } finally {
        this.saving = false
      }
    },

    assignTest(groupId) {
      this.$router.push(`/teacher/tests/assign?group=${groupId}`)
    },

    viewGroupStats(groupId) {
      this.$router.push(`/teacher/group/${groupId}/stats`)
    },

    viewStudentProfile(studentId) {
      this.$router.push(`/profile/${studentId}`)
    },

    getScoreClass(score) {
      if (score >= 80) return 'good'
      if (score >= 60) return 'medium'
      return 'bad'
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Сегодня'
      if (diffDays === 1) return 'Вчера'
      if (diffDays < 7) return `${diffDays} дня назад`
      return date.toLocaleDateString('ru-RU')
    }
  }
}
</script>

<style scoped>
/* Добавляем стили для состояний загрузки и ошибок */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 2px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.error-state h3,
.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.error-state p,
.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-list {
  padding: 20px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border: 1px solid #eee;
}

/* Остальные стили остаются без изменений */
.teacher-groups {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.teacher-main {
  padding: 120px 0 60px;
  flex: 1;
}

.teacher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.teacher-title {
  font-size: 2.5rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  line-height: 1.2;
}

.teacher-subtitle {
  color: #666;
  font-size: 1rem;
}

/* Табы */
.groups-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #111;
}

.tab-btn.active {
  color: #111;
  font-weight: 500;
  border-bottom: 2px solid #111;
}

/* Сетка групп */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.group-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  transition: border-color 0.2s;
}

.group-card:hover {
  border-color: #111;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.group-name {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

.group-actions {
  display: flex;
  gap: 4px;
}

.group-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.group-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #666;
}

.group-stats strong {
  color: #111;
  font-weight: 500;
}

.group-students {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.student-chip {
  padding: 2px 8px;
  background: #f5f5f5;
  border: 1px solid #eee;
  font-size: 0.85rem;
  color: #666;
}

.more-students {
  padding: 2px 8px;
  color: #999;
  font-size: 0.85rem;
}

.group-footer {
  display: flex;
  gap: 8px;
}

/* Таблица студентов */
.students-filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #111;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #eee;
}

.students-table th {
  text-align: left;
  padding: 16px 12px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #999;
  border-bottom: 1px solid #eee;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.students-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f5f5f5;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #666;
}

.score-badge {
  padding: 2px 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.score-badge.good {
  background: #e8f5e9;
  color: #2e7d32;
}

.score-badge.medium {
  background: #fff3e0;
  color: #f57c00;
}

.score-badge.bad {
  background: #ffebee;
  color: #c62828;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 450;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #666;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #111;
}

.student-selector {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
}

.students-list {
  padding: 8px;
}

.student-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
}

.student-checkbox:hover {
  background: #fafafa;
}

.student-checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* Кнопки */
.btn {
  display: inline-block;
  padding: 10px 20px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  background: none;
}

.btn-primary {
  background: #111;
  color: white;
  border-color: #111;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #111;
  border-color: #ddd;
}

.btn-outline:hover {
  border-color: #111;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  border-color: #111;
}

.icon-btn.delete:hover {
  border-color: #f44336;
  color: #f44336;
}

.btn-link-small {
  background: none;
  border: none;
  color: #666;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-link-small:hover {
  color: #111;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .groups-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .teacher-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .groups-grid {
    grid-template-columns: 1fr;
  }

  .students-filters {
    grid-template-columns: 1fr;
  }

  .students-table {
    display: block;
    overflow-x: auto;
  }

  .group-footer {
    flex-direction: column;
  }

  .modal {
    padding: 24px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>