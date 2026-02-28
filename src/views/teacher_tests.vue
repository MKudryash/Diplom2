<template>
  <div class="teacher-tests">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="teacher-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка тестов...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">❌</p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="loadTests" class="btn btn-primary">Повторить</button>
        </div>

        <template v-else>
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
            <div v-if="paginatedTests.length === 0" class="empty-state">
              <p class="empty-icon">📝</p>
              <h3>Тесты не найдены</h3>
              <p>Создайте свой первый тест</p>
              <button @click="createNewTest" class="btn btn-primary">
                Создать тест
              </button>
            </div>

            <div v-else class="tests-grid">
              <div v-for="test in paginatedTests" :key="test.id" class="test-card">
                <div class="test-card-header">
                  <span class="test-status" :class="test.status">
                    {{ statusLabel(test.status) }}
                  </span>
                  <div class="test-actions">
                    <button @click="editTest(test.id)" class="icon-btn" title="Редактировать">✎</button>
                    <button @click="duplicateTest(test.id)" class="icon-btn" title="Дублировать">📋</button>
                    <button @click="toggleArchive(test.id, test.status)" class="icon-btn" :title="test.status === 'archived' ? 'Восстановить' : 'Архивировать'">
                      {{ test.status === 'archived' ? '↩' : '📦' }}
                    </button>
                    <button @click="deleteTest(test.id)" class="icon-btn delete" title="Удалить">✕</button>
                  </div>
                </div>

                <h3 class="test-title">{{ test.title }}</h3>
                <p class="test-description">{{ test.description || 'Нет описания' }}</p>

                <div class="test-meta">
                  <div class="meta-item">
                    <span class="meta-icon">📊</span>
                    <span>{{ test.questions_count || 0 }} вопросов</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span>{{ test.time_limit || 0 }} мин</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span>{{ test.attempts_count || 0 }} прохождений</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>{{ formatDate(test.updated_at || test.created_at) }}</span>
                  </div>
                </div>

                <div class="test-card-footer">
                  <div class="test-groups">
                    <span class="group-tag" v-for="group in test.groups" :key="group">
                      {{ group }}
                    </span>
                    <span v-if="!test.groups?.length" class="group-tag no-group">Не назначен</span>
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
        </template>
      </div>
    </main>

    <!-- Футер -->
    <app-footer></app-footer>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
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
      loading: true,
      error: null,
      searchQuery: '',
      statusFilter: 'all',
      sortBy: 'newest',
      currentPage: 1,
      pageSize: 10,

      tests: []
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
            (t.description && t.description.toLowerCase().includes(query))
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
        totalAttempts: this.tests.reduce((sum, t) => sum + (t.attempts_count || 0), 0)

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
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    statusFilter() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    }
  },
  async created() {
    await this.loadTests()
  },
  methods: {
    async loadTests() {
      this.loading = true
      this.error = null

      try {
        // Получаем текущего пользователя
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) {
          this.$router.push('/login')
          return
        }

        // Загружаем тесты преподавателя
        const { data: testsData, error: testsError } = await supabase
            .from('tests')
            .select(`
              id,
              title,
              description,
              status,
              time_limit,
              created_at,
              updated_at,
              questions:questions(count)
            `)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
        if (testsError) throw testsError

        // Для каждого теста получаем дополнительную информацию
        this.tests = await Promise.all((testsData || []).map(async (test) => {
          // Получаем количество попыток
          const { count: attemptsCount, error: attemptsError } = await supabase
              .from('attempts')
              .select('*', { count: 'exact', head: true })
              .eq('test_id', test.id)
              .eq('status', 'completed')

          console.log(attemptsCount, attemptsError)

          if (attemptsError) {
            console.error('Error loading attempts:', attemptsError)
          }

          // Получаем группы, которым назначен тест
          const { data: assignments, error: assignmentsError } = await supabase
              .from('test_assignments')
              .select(`
                groups (
                  name
                )
              `)
              .eq('test_id', test.id)

          if (assignmentsError) {
            console.error('Error loading assignments:', assignmentsError)
          }

          const groups = assignments
              ?.map(a => a.groups?.name)
              .filter(Boolean) || []

          return {
            ...test,
            questions_count: test.questions?.[0]?.count || 0,
            attempts_count: attemptsCount || 0,
            groups
          }

        }))

      } catch (error) {
        console.error('Error loading tests:', error)
        this.error = error.message || 'Не удалось загрузить тесты'
      } finally {
        this.loading = false
      }
    },

    statusLabel(status) {
      const labels = {
        published: 'Опубликовано',
        draft: 'Черновик',
        archived: 'В архиве'
      }
      return labels[status] || status
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    sortTests(tests) {
      const sorted = [...tests]

      switch (this.sortBy) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        case 'oldest':
          return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        case 'name':
          return sorted.sort((a, b) => a.title.localeCompare(b.title))
        case 'attempts':
          return sorted.sort((a, b) => (b.attempts_count || 0) - (a.attempts_count || 0))
        default:
          return sorted
      }
    },

    createNewTest() {
      this.$router.push('/teacher/test/new/edit')
    },

    editTest(id) {
      this.$router.push(`/teacher/test/${id}/edit`)
    },

    async duplicateTest(id) {
      try {
        const testToDuplicate = this.tests.find(t => t.id === id)
        if (!testToDuplicate) return

        const { data: { user } } = await supabase.auth.getUser()

        // Создаем копию теста
        const { data: newTest, error: createError } = await supabase
            .from('tests')
            .insert([{
              title: `${testToDuplicate.title} (копия)`,
              description: testToDuplicate.description,
              time_limit: testToDuplicate.time_limit,
              passing_score: 70,
              difficulty: 'intermediate',
              status: 'draft',
              created_by: user.id
            }])
            .select()
            .single()

        if (createError) throw createError

        // Копируем вопросы (в реальном проекте нужно копировать и вопросы)
        alert('Тест успешно скопирован')
        await this.loadTests()

      } catch (error) {
        console.error('Error duplicating test:', error)
        alert('Ошибка при дублировании теста')
      }
    },

    async toggleArchive(id, currentStatus) {
      const newStatus = currentStatus === 'archived' ? 'draft' : 'archived'
      const action = currentStatus === 'archived' ? 'восстановить' : 'архивировать'

      if (!confirm(`Вы уверены, что хотите ${action} этот тест?`)) return

      try {
        const { error } = await supabase
            .from('tests')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error

        await this.loadTests()

      } catch (error) {
        console.error('Error toggling archive:', error)
        alert(`Ошибка при ${action} теста`)
      }
    },

    async deleteTest(id) {
      if (!confirm('Удалить тест? Это действие нельзя отменить.')) return

      try {
        // Сначала удаляем связанные ответы
        const { error: answersError } = await supabase
            .from('answers')
            .delete()
            .in('attempt_id', supabase
                .from('attempts')
                .select('id')
                .eq('test_id', id)
            )

        if (answersError) throw answersError

        // Удаляем попытки
        const { error: attemptsError } = await supabase
            .from('attempts')
            .delete()
            .eq('test_id', id)

        if (attemptsError) throw attemptsError

        // Удаляем вопросы
        const { error: questionsError } = await supabase
            .from('questions')
            .delete()
            .eq('test_id', id)

        if (questionsError) throw questionsError

        // Удаляем назначения теста
        const { error: assignmentsError } = await supabase
            .from('test_assignments')
            .delete()
            .eq('test_id', id)

        if (assignmentsError) throw assignmentsError

        // Удаляем сам тест
        const { error: testError } = await supabase
            .from('tests')
            .delete()
            .eq('id', id)

        if (testError) throw testError

        await this.loadTests()

      } catch (error) {
        console.error('Error deleting test:', error)
        alert('Ошибка при удалении теста')
      }
    },

    viewReports(id) {
      this.$router.push(`/test/${id}/review`)
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

.group-tag.no-group {
  background: #fafafa;
  color: #999;
  border-color: #eee;
}

/* Остальные стили остаются без изменений */
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