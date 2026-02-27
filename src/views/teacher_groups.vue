<template>
  <div class="teacher-groups">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <main class="teacher-main">
      <div class="container">
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
          <div class="groups-grid">
            <div v-for="group in groups" :key="group.id" class="group-card">
              <div class="group-header">
                <h3 class="group-name">{{ group.name }}</h3>
                <div class="group-actions">
                  <button @click="editGroup(group.id)" class="icon-btn">✎</button>
                  <button @click="deleteGroup(group.id)" class="icon-btn delete">✕</button>
                </div>
              </div>

              <p class="group-description">{{ group.description }}</p>

              <div class="group-stats">
                <span class="stat">
                  <strong>{{ group.students.length }}</strong> студентов
                </span>
                <span class="stat">
                  <strong>{{ group.testsAssigned }}</strong> тестов
                </span>
              </div>

              <div class="group-students">
                <div v-for="student in group.students.slice(0, 3)" :key="student.id" class="student-chip">
                  {{ student.name }}
                </div>
                <span v-if="group.students.length > 3" class="more-students">
                  +{{ group.students.length - 3 }}
                </span>
              </div>

              <div class="group-footer">
                <button @click="assignTest(group.id)" class="btn btn-outline btn-sm">
                  Назначить тест
                </button>
                <button @click="viewGroupStats(group.id)" class="btn btn-outline btn-sm">
                  Статистика
                </button>
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

          <table class="students-table">
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
              <td>{{ student.group }}</td>
              <td>{{ student.testsPassed }}</td>
              <td>
                  <span class="score-badge" :class="getScoreClass(student.avgScore)">
                    {{ student.avgScore }}%
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
      </div>
    </main>

    <!-- Модальное окно создания группы -->
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
              <div class="students-list">
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
            <button type="submit" class="btn btn-primary">Сохранить</button>
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
      studentSearch: '',
      groupFilter: 'all',
      studentSearchInput: '',

      groups: [
        {
          id: 1,
          name: 'ПИ-201',
          description: 'Программная инженерия, 2 курс',
          students: [
            { id: 1, name: 'Алексей Иванов', initials: 'АИ' },
            { id: 2, name: 'Мария Петрова', initials: 'МП' },
            { id: 3, name: 'Дмитрий Сидоров', initials: 'ДС' },
            { id: 4, name: 'Анна Козлова', initials: 'АК' }
          ],
          testsAssigned: 5
        },
        {
          id: 2,
          name: 'ПИ-202',
          description: 'Программная инженерия, 2 курс',
          students: [
            { id: 5, name: 'Игорь Смирнов', initials: 'ИС' },
            { id: 6, name: 'Елена Васильева', initials: 'ЕВ' }
          ],
          testsAssigned: 3
        },
        {
          id: 3,
          name: 'ПИ-301',
          description: 'Программная инженерия, 3 курс',
          students: [
            { id: 7, name: 'Сергей Николаев', initials: 'СН' },
            { id: 8, name: 'Ольга Морозова', initials: 'ОМ' },
            { id: 9, name: 'Павел Федоров', initials: 'ПФ' }
          ],
          testsAssigned: 7
        }
      ],

      allStudents: [
        { id: 1, name: 'Алексей Иванов', initials: 'АИ', email: 'alexey@example.com', group: 'ПИ-201', testsPassed: 24, avgScore: 78, lastActive: '2026-03-20' },
        { id: 2, name: 'Мария Петрова', initials: 'МП', email: 'maria@example.com', group: 'ПИ-201', testsPassed: 32, avgScore: 92, lastActive: '2026-03-21' },
        { id: 3, name: 'Дмитрий Сидоров', initials: 'ДС', email: 'dmitry@example.com', group: 'ПИ-201', testsPassed: 18, avgScore: 65, lastActive: '2026-03-19' },
        { id: 4, name: 'Анна Козлова', initials: 'АК', email: 'anna@example.com', group: 'ПИ-201', testsPassed: 28, avgScore: 85, lastActive: '2026-03-20' },
        { id: 5, name: 'Игорь Смирнов', initials: 'ИС', email: 'igor@example.com', group: 'ПИ-202', testsPassed: 15, avgScore: 72, lastActive: '2026-03-18' },
        { id: 6, name: 'Елена Васильева', initials: 'ЕВ', email: 'elena@example.com', group: 'ПИ-202', testsPassed: 21, avgScore: 88, lastActive: '2026-03-21' },
        { id: 7, name: 'Сергей Николаев', initials: 'СН', email: 'sergey@example.com', group: 'ПИ-301', testsPassed: 35, avgScore: 81, lastActive: '2026-03-20' },
        { id: 8, name: 'Ольга Морозова', initials: 'ОМ', email: 'olga@example.com', group: 'ПИ-301', testsPassed: 42, avgScore: 94, lastActive: '2026-03-21' },
        { id: 9, name: 'Павел Федоров', initials: 'ПФ', email: 'pavel@example.com', group: 'ПИ-301', testsPassed: 27, avgScore: 76, lastActive: '2026-03-19' }
      ],

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
          filtered = filtered.filter(s => s.group === group.name)
        }
      }

      return filtered
    },

    availableStudents() {
      if (!this.studentSearchInput) return this.allStudents

      const query = this.studentSearchInput.toLowerCase()
      return this.allStudents.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    createGroup() {
      this.editingGroup = false
      this.groupForm = {
        name: '',
        description: '',
        students: []
      }
      this.showGroupModal = true
    },

    editGroup(id) {
      const group = this.groups.find(g => g.id === id)
      if (group) {
        this.editingGroup = true
        this.groupForm = {
          name: group.name,
          description: group.description,
          students: group.students.map(s => s.id)
        }
        this.showGroupModal = true
      }
    },

    deleteGroup(id) {
      if (confirm('Удалить группу?')) {
        console.log('Delete group:', id)
      }
    },

    saveGroup() {
      console.log('Save group:', this.groupForm)
      this.showGroupModal = false
    },

    assignTest(groupId) {
      this.$router.push(`/teacher/tests/assign?group=${groupId}`)
    },

    viewGroupStats(groupId) {
      this.$router.push(`/teacher/group/${groupId}/stats`)
    },

    viewStudentProfile(studentId) {
      this.$router.push(`/student/${studentId}`)
    },

    getScoreClass(score) {
      if (score >= 80) return 'good'
      if (score >= 60) return 'medium'
      return 'bad'
    },

    formatDate(date) {
      const d = new Date(date)
      return d.toLocaleDateString('ru-RU')
    }
  }
}
</script>

<style scoped>
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

.btn-primary:hover {
  background: #333;
  border-color: #333;
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