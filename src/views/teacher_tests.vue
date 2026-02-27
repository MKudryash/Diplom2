<template>
  <div class="teacher-tests">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="teacher-main">
      <div class="container">
        <!-- Заголовок -->
        <div class="teacher-header">
          <div>
            <h1 class="teacher-title">Мои тесты</h1>
            <p class="teacher-subtitle">Управляйте созданными тестами</p>
          </div>
          <button @click="createNewTest" class="btn btn-primary">
            + Создать новый тест
          </button>
        </div>

        <!-- Фильтры и поиск -->
        <div class="tests-filters">
          <div class="search-wrapper">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск по названию..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>

          <div class="filter-group">
            <select v-model="statusFilter" class="filter-select">
              <option value="all">Все статусы</option>
              <option value="published">Опубликовано</option>
              <option value="draft">Черновик</option>
              <option value="archived">В архиве</option>
            </select>
          </div>

          <div class="filter-group">
            <select v-model="sortBy" class="filter-select">
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="name">По названию</option>
              <option value="attempts">По популярности</option>
            </select>
          </div>
        </div>

        <!-- Статистика -->
        <div class="tests-stats">
          <div class="stat-card">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Всего тестов</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.published }}</span>
            <span class="stat-label">Опубликовано</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.drafts }}</span>
            <span class="stat-label">Черновиков</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.totalAttempts }}</span>
            <span class="stat-label">Всего прохождений</span>
          </div>
        </div>

        <!-- Список тестов -->
        <div class="tests-list">
          <div v-if="filteredTests.length === 0" class="empty-state">
            <p class="empty-icon">📝</p>
            <h3>Тесты не найдены</h3>
            <p>Создайте свой первый тест</p>
            <button @click="createNewTest" class="btn btn-primary">
              Создать тест
            </button>
          </div>

          <div v-else class="tests-grid">
            <div v-for="test in filteredTests" :key="test.id" class="test-card">
              <div class="test-card-header">
                <span class="test-status" :class="test.status">
                  {{ statusLabel(test.status) }}
                </span>
                <div class="test-actions">
                  <button @click="editTest(test.id)" class="icon-btn" title="Редактировать">✎</button>
                  <button @click="duplicateTest(test.id)" class="icon-btn" title="Дублировать">📋</button>
                  <button @click="archiveTest(test.id)" class="icon-btn" title="Архивировать">📦</button>
                  <button @click="deleteTest(test.id)" class="icon-btn delete" title="Удалить">✕</button>
                </div>
              </div>

              <h3 class="test-title">{{ test.title }}</h3>
              <p class="test-description">{{ test.description }}</p>

              <div class="test-meta">
                <div class="meta-item">
                  <span class="meta-icon">📊</span>
                  <span>{{ test.questions }} вопросов</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">⏱️</span>
                  <span>{{ test.time }} мин</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">👥</span>
                  <span>{{ test.attempts }} прохождений</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>{{ formatDate(test.updatedAt) }}</span>
                </div>
              </div>

              <div class="test-card-footer">
                <div class="test-groups">
                  <span class="group-tag" v-for="group in test.groups" :key="group">
                    {{ group }}
                  </span>
                </div>
                <button @click="viewReports(test.id)" class="btn btn-outline btn-sm">
                  Отчеты
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">←</button>
          <span class="pagination-info">{{ currentPage }} из {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">→</button>
        </div>
      </div>
    </main>

    <!-- Футер -->
    <app-footer></app-footer>
  </div>
</template>

<script>
import AppNavigation from '../components/navigation'
import AppFooter from '../components/footer'

export default {
  name: 'TeacherTests',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'newest',
      currentPage: 1,
      pageSize: 10,

      tests: [
        {
          id: 1,
          title: 'Основы JavaScript',
          description: 'Тест для проверки знаний основ JavaScript',
          status: 'published',
          questions: 25,
          time: 30,
          attempts: 234,
          updatedAt: '2026-03-15',
          groups: ['ПИ-201', 'ПИ-202']
        },
        {
          id: 2,
          title: 'Продвинутый JavaScript',
          description: 'Сложные концепции: замыкания, прототипы, асинхронность',
          status: 'published',
          questions: 30,
          time: 45,
          attempts: 156,
          updatedAt: '2026-03-10',
          groups: ['ПИ-301']
        },
        {
          id: 3,
          title: 'Python для начинающих',
          description: 'Основы Python для первокурсников',
          status: 'draft',
          questions: 20,
          time: 25,
          attempts: 0,
          updatedAt: '2026-03-05',
          groups: []
        },
        {
          id: 4,
          title: 'Алгоритмы и структуры данных',
          description: 'Тест по алгоритмам для подготовки к собеседованиям',
          status: 'published',
          questions: 35,
          time: 60,
          attempts: 89,
          updatedAt: '2026-02-28',
          groups: ['ПИ-401']
        },
        {
          id: 5,
          title: 'Базы данных',
          description: 'SQL, нормализация, транзакции',
          status: 'archived',
          questions: 25,
          time: 40,
          attempts: 67,
          updatedAt: '2026-01-15',
          groups: ['ПИ-301', 'ПИ-302']
        }
      ]
    }
  },
  computed: {
    filteredTests() {
      let filtered = this.tests

      // Поиск
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
        )
      }

      // Фильтр по статусу
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === this.statusFilter)
      }

      // Сортировка
      filtered = this.sortTests(filtered)

      return filtered
    },

    stats() {
      return {
        total: this.tests.length,
        published: this.tests.filter(t => t.status === 'published').length,
        drafts: this.tests.filter(t => t.status === 'draft').length,
        archived: this.tests.filter(t => t.status === 'archived').length,
        totalAttempts: this.tests.reduce((sum, t) => sum + t.attempts, 0)
      }
    },

    totalPages() {
      return Math.ceil(this.filteredTests.length / this.pageSize)
    },

    paginatedTests() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredTests.slice(start, start + this.pageSize)
    }
  },
  methods: {
    statusLabel(status) {
      const labels = {
        published: 'Опубликовано',
        draft: 'Черновик',
        archived: 'В архиве'
      }
      return labels[status] || status
    },

    formatDate(date) {
      const d = new Date(date)
      return d.toLocaleDateString('ru-RU')
    },

    sortTests(tests) {
      const sorted = [...tests]

      switch (this.sortBy) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        case 'oldest':
          return sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
        case 'name':
          return sorted.sort((a, b) => a.title.localeCompare(b.title))
        case 'attempts':
          return sorted.sort((a, b) => b.attempts - a.attempts)
        default:
          return sorted
      }
    },

    createNewTest() {
      this.$router.push('/teacher/test/new')
    },

    editTest(id) {
      this.$router.push(`/teacher/test/${id}/edit`)
    },

    duplicateTest(id) {
      console.log('Duplicate test:', id)
      // Логика дублирования
    },

    archiveTest(id) {
      console.log('Archive test:', id)
      // Логика архивации
    },

    deleteTest(id) {
      if (confirm('Удалить тест?')) {
        console.log('Delete test:', id)
        // Логика удаления
      }
    },

    viewReports(id) {
      this.$router.push(`/teacher/test/${id}/reports`)
    }
  }
}
</script>

<style scoped>
.teacher-tests {
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

.tests-filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: border-color 0.2s;
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
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M7%2010L2%205h10z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.filter-select:focus {
  outline: none;
  border-color: #111;
}

.tests-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 450;
  line-height: 1.2;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tests-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.test-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  transition: border-color 0.2s;
}

.test-card:hover {
  border-color: #111;
}

.test-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.test-status {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
}

.test-status.published {
  border-color: #4caf50;
  color: #2e7d32;
}

.test-status.draft {
  border-color: #ff9800;
  color: #f57c00;
}

.test-status.archived {
  border-color: #999;
  color: #666;
}

.test-actions {
  display: flex;
  gap: 8px;
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

.test-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.test-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.test-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-groups {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.group-tag {
  padding: 2px 8px;
  background: #f5f5f5;
  border: 1px solid #eee;
  font-size: 0.85rem;
  color: #666;
}

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

.empty-state {
  text-align: center;
  padding: 80px 0;
  background: white;
  border: 1px solid #eee;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #111;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
}

@media (max-width: 768px) {
  .teacher-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .tests-filters {
    grid-template-columns: 1fr;
  }

  .tests-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .test-meta {
    flex-wrap: wrap;
    gap: 12px;
  }

  .test-card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>