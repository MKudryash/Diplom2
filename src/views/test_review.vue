<template>
  <div class="test-reports">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <main class="reports-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка отчетов...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">❌</p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="backToTests" class="btn btn-primary">
            Вернуться к тестам
          </button>
        </div>

        <!-- Нет данных -->
        <div v-else-if="!test" class="empty-state">
          <p class="empty-icon">📊</p>
          <h3>Тест не найден</h3>
          <button @click="backToTests" class="btn btn-primary">
            Вернуться к тестам
          </button>
        </div>

        <template v-else>
          <!-- Хлебные крошки -->
          <div class="breadcrumbs">
            <a href="/teacher/tests" class="breadcrumb-link">Мои тесты</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ test.title }} — Отчеты</span>
          </div>

          <!-- Заголовок -->
          <div class="reports-header">
            <h1 class="reports-title">{{ test.title }}</h1>
            <div class="header-actions">
              <button @click="exportReports" class="btn btn-outline" :disabled="exporting">
                {{ exporting ? 'Экспорт...' : '📊 Экспорт отчетов' }}
              </button>
            </div>
          </div>

          <!-- Общая статистика -->
          <div class="overall-stats">
            <div class="stat-card">
              <span class="stat-value">{{ stats.totalAttempts }}</span>
              <span class="stat-label">Всего прохождений</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.completedAttempts }}</span>
              <span class="stat-label">Завершено</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.averageScore }}%</span>
              <span class="stat-label">Средний балл</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.averageTime }} мин</span>
              <span class="stat-label">Среднее время</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.passRate }}%</span>
              <span class="stat-label">Успеваемость</span>
            </div>
          </div>

          <!-- Табы -->
          <div class="reports-tabs">
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'overview' }"
                @click="activeTab = 'overview'"
            >
              Обзор
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'questions' }"
                @click="activeTab = 'questions'"
            >
              Анализ вопросов
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'students' }"
                @click="activeTab = 'students'"
            >
              Результаты студентов
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'distribution' }"
                @click="activeTab = 'distribution'"
            >
              Распределение
            </button>
          </div>

          <!-- Вкладка: Обзор -->
          <div v-if="activeTab === 'overview'" class="overview-tab">
            <!-- График прохождений -->
            <div class="chart-section">
              <h3>Динамика прохождений</h3>
              <div class="chart-container">
                <div v-if="dailyStats.length === 0" class="no-data-message">
                  Нет данных за последние 7 дней
                </div>
                <div v-else class="mini-chart">
                  <div v-for="(day, index) in dailyStats" :key="index" class="chart-column">
                    <div class="chart-bar" :style="{ height: day.percentage + '%' }"></div>
                    <span class="chart-label">{{ day.date }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Распределение оценок -->
            <div class="grades-section">
              <h3>Распределение оценок</h3>
              <div class="grades-grid">
                <div class="grade-item">
                  <span class="grade-label">Отлично (≥85%)</span>
                  <div class="grade-bar">
                    <div class="grade-fill excellent" :style="{ width: grades.excellent + '%' }"></div>
                  </div>
                  <span class="grade-value">{{ grades.excellent }}%</span>
                </div>
                <div class="grade-item">
                  <span class="grade-label">Хорошо (70-84%)</span>
                  <div class="grade-bar">
                    <div class="grade-fill good" :style="{ width: grades.good + '%' }"></div>
                  </div>
                  <span class="grade-value">{{ grades.good }}%</span>
                </div>
                <div class="grade-item">
                  <span class="grade-label">Удовл. (50-69%)</span>
                  <div class="grade-bar">
                    <div class="grade-fill satisfactory" :style="{ width: grades.satisfactory + '%' }"></div>
                  </div>
                  <span class="grade-value">{{ grades.satisfactory }}%</span>
                </div>
                <div class="grade-item">
                  <span class="grade-label">Неуд. (<50%)</span>
                  <div class="grade-bar">
                    <div class="grade-fill poor" :style="{ width: grades.poor + '%' }"></div>
                  </div>
                  <span class="grade-value">{{ grades.poor }}%</span>
                </div>
              </div>
            </div>

            <!-- Статистика по группам -->
            <div class="groups-section">
              <h3>Статистика по группам</h3>
              <table v-if="groupStats.length > 0" class="groups-table">
                <thead>
                <tr>
                  <th>Группа</th>
                  <th>Студентов</th>
                  <th>Прошли</th>
                  <th>Средний балл</th>
                  <th>Успеваемость</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="group in groupStats" :key="group.name">
                  <td>{{ group.name }}</td>
                  <td>{{ group.students }}</td>
                  <td>{{ group.completed }}</td>
                  <td>{{ group.avgScore }}%</td>
                  <td>
                    <div class="progress-small">
                      <div class="progress-fill" :style="{ width: group.passRate + '%' }"></div>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
              <div v-else class="no-data-message">
                Нет данных по группам
              </div>
            </div>
          </div>

          <!-- Вкладка: Анализ вопросов -->
          <div v-if="activeTab === 'questions'" class="questions-tab">
            <div v-if="questionsAnalysis.length === 0" class="no-data-message">
              Нет данных для анализа вопросов
            </div>
            <div v-else class="questions-analysis">
              <div v-for="(q, index) in questionsAnalysis" :key="q.id" class="question-analysis-card">
                <div class="question-header">
                  <span class="question-number">Вопрос {{ index + 1 }}</span>
                  <span class="question-difficulty" :class="q.difficulty">
                    {{ difficultyLabel(q.difficulty) }}
                  </span>
                </div>

                <p class="question-text">{{ q.text }}</p>

                <div class="question-stats">
                  <div class="stat-row">
                    <span>Правильных ответов:</span>
                    <strong>{{ q.correctAnswers }}%</strong>
                  </div>
                  <div class="stat-row">
                    <span>Среднее время:</span>
                    <strong>{{ q.avgTime }} сек</strong>
                  </div>
                </div>

                <div class="answers-distribution">
                  <div v-for="(opt, optIndex) in q.options" :key="optIndex" class="answer-dist">
                    <span class="answer-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
                    <span class="answer-text">{{ opt.text }}</span>
                    <span class="answer-percent">{{ opt.percent }}%</span>
                    <div class="dist-bar">
                      <div
                          class="dist-fill"
                          :class="{ correct: opt.correct }"
                          :style="{ width: opt.percent + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Вкладка: Результаты студентов -->
          <div v-if="activeTab === 'students'" class="students-tab">
            <div class="students-filters">
              <div class="search-wrapper">
                <input
                    type="text"
                    v-model="studentSearch"
                    placeholder="Поиск по имени..."
                    class="search-input"
                />
              </div>

              <select v-model="groupFilter" class="filter-select">
                <option value="all">Все группы</option>
                <option v-for="group in uniqueGroups" :key="group" :value="group">
                  {{ group }}
                </option>
              </select>

              <select v-model="statusFilter" class="filter-select">
                <option value="all">Все статусы</option>
                <option value="passed">Пройдено</option>
                <option value="failed">Не пройдено</option>
              </select>
            </div>

            <div v-if="filteredResults.length === 0" class="no-data-message">
              Нет результатов, соответствующих фильтрам
            </div>
            <table v-else class="students-results-table">
              <thead>
              <tr>
                <th>Студент</th>
                <th>Группа</th>
                <th>Баллы</th>
                <th>Результат</th>
                <th>Время</th>
                <th>Дата</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="result in filteredResults" :key="result.id">
                <td>{{ result.studentName }}</td>
                <td>{{ result.group }}</td>
                <td>{{ result.score }}/{{ result.maxScore }} ({{ result.percentage }}%)</td>
                <td>
                  <span class="status-badge" :class="result.passed ? 'passed' : 'failed'">
                    {{ result.passed ? 'Пройдено' : 'Не пройдено' }}
                  </span>
                </td>
                <td>{{ formatTime(result.timeSpent) }}</td>
                <td>{{ formatDate(result.date) }}</td>
                <td>
                  <button @click="viewDetailedResult(result.id)" class="btn-link-small">
                    Детали
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Вкладка: Распределение -->
          <div v-if="activeTab === 'distribution'" class="distribution-tab">
            <div class="distribution-grid">
              <!-- Гистограмма баллов -->
              <div class="distribution-card">
                <h3>Распределение баллов</h3>
                <div v-if="scoreRanges.length === 0" class="no-data-message">
                  Нет данных
                </div>
                <div v-else class="histogram">
                  <div v-for="(range, index) in scoreRanges" :key="index" class="histogram-row">
                    <span class="range-label">{{ range.label }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ width: range.percentage + '%' }"></div>
                    </div>
                    <span class="range-value">{{ range.count }} ({{ range.percentage }}%)</span>
                  </div>
                </div>
              </div>

              <!-- Распределение по времени -->
              <div class="distribution-card">
                <h3>Время выполнения</h3>
                <div class="time-distribution">
                  <div class="time-stat">
                    <span class="time-label">Минимальное:</span>
                    <span class="time-value">{{ timeStats.min }} мин</span>
                  </div>
                  <div class="time-stat">
                    <span class="time-label">Максимальное:</span>
                    <span class="time-value">{{ timeStats.max }} мин</span>
                  </div>
                  <div class="time-stat">
                    <span class="time-label">Среднее:</span>
                    <span class="time-value">{{ timeStats.avg }} мин</span>
                  </div>
                  <div class="time-stat">
                    <span class="time-label">Медиана:</span>
                    <span class="time-value">{{ timeStats.median }} мин</span>
                  </div>
                </div>
              </div>

              <!-- Сложность вопросов -->
              <div class="distribution-card">
                <h3>Сложность вопросов</h3>
                <div class="difficulty-chart">
                  <div class="difficulty-item">
                    <span class="difficulty-label">Легкие (>80% правильных)</span>
                    <span class="difficulty-value">{{ difficultyStats.easy }}</span>
                  </div>
                  <div class="difficulty-item">
                    <span class="difficulty-label">Средние (50-80%)</span>
                    <span class="difficulty-value">{{ difficultyStats.medium }}</span>
                  </div>
                  <div class="difficulty-item">
                    <span class="difficulty-label">Сложные (<50%)</span>
                    <span class="difficulty-value">{{ difficultyStats.hard }}</span>
                  </div>
                </div>
              </div>
            </div>
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
  name: 'TestReports',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      testId: null,
      activeTab: 'overview',
      studentSearch: '',
      groupFilter: 'all',
      statusFilter: 'all',
      loading: true,
      exporting: false,
      error: null,

      test: null,
      attempts: [],
      questions: [],
      students: [],

      // Computed data
      stats: {
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        passRate: 0
      },
      dailyStats: [],
      grades: {
        excellent: 0,
        good: 0,
        satisfactory: 0,
        poor: 0
      },
      groupStats: [],
      questionsAnalysis: [],
      studentResults: [],
      scoreRanges: [],
      timeStats: {
        min: 0,
        max: 0,
        avg: 0,
        median: 0
      },
      difficultyStats: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    }
  },
  computed: {
    uniqueGroups() {
      const groups = new Set(this.studentResults.map(r => r.group).filter(Boolean))
      return Array.from(groups).sort()
    },

    filteredResults() {
      let filtered = this.studentResults

      if (this.studentSearch) {
        const query = this.studentSearch.toLowerCase()
        filtered = filtered.filter(r =>
            r.studentName.toLowerCase().includes(query)
        )
      }

      if (this.groupFilter !== 'all') {
        filtered = filtered.filter(r => r.group === this.groupFilter)
      }

      if (this.statusFilter !== 'all') {
        const passed = this.statusFilter === 'passed'
        filtered = filtered.filter(r => r.passed === passed)
      }

      return filtered
    }
  },
  async created() {
    this.testId = this.$route.params.id
    await this.loadReports()
  },
  methods: {
    async loadReports() {
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

        // Загружаем информацию о тесте
        await this.loadTestInfo()

        if (!this.test) {
          this.loading = false
          return
        }

        // Загружаем все попытки по этому тесту
        await this.loadAttempts()

        // Загружаем вопросы
        await this.loadQuestions()

        // Загружаем информацию о студентах
        await this.loadStudents()

        // Вычисляем всю статистику
        this.calculateStats()
        this.calculateDailyStats()
        this.calculateGrades()
        this.calculateGroupStats()
        this.calculateQuestionsAnalysis()
        this.calculateStudentResults()
        this.calculateScoreRanges()
        this.calculateTimeStats()
        this.calculateDifficultyStats()

      } catch (error) {
        console.error('Error loading reports:', error)
        this.error = error.message || 'Не удалось загрузить отчеты'
      } finally {
        this.loading = false
      }
    },

    async loadTestInfo() {
      try {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .eq('id', this.testId)
            .single()

        if (error) throw error
        this.test = data
      } catch (error) {
        console.error('Error loading test:', error)
        this.test = null
      }
    },

    async loadAttempts() {
      try {
        const { data, error } = await supabase
            .from('attempts')
            .select('*')
            .eq('test_id', this.testId)
            .order('started_at', { ascending: false })

        if (error) throw error
        this.attempts = data || []
      } catch (error) {
        console.error('Error loading attempts:', error)
        this.attempts = []
      }
    },

    async loadQuestions() {
      try {
        const { data, error } = await supabase
            .from('questions')
            .select(`
              id,
              text,
              difficulty,
              options (*)
            `)
            .eq('test_id', this.testId)
            .order('order', { ascending: true })

        if (error) throw error
        this.questions = data || []
      } catch (error) {
        console.error('Error loading questions:', error)
        this.questions = []
      }
    },

    async loadStudents() {
      const userIds = [...new Set(this.attempts.map(a => a.user_id))]
      if (userIds.length === 0) return

      try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, group_name')
            .in('id', userIds)

        if (error) throw error

        // Создаем карту для быстрого доступа
        const studentsMap = new Map()
        data.forEach(student => {
          studentsMap.set(student.id, {
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Студент',
            group: student.group_name || 'Без группы'
          })
        })

        this.students = studentsMap
      } catch (error) {
        console.error('Error loading students:', error)
        this.students = new Map()
      }
    },

    calculateStats() {
      const completed = this.attempts.filter(a => a.status === 'completed')

      this.stats = {
        totalAttempts: this.attempts.length,
        completedAttempts: completed.length,
        averageScore: completed.length > 0
            ? Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length)
            : 0,
        averageTime: completed.length > 0
            ? Math.round(completed.reduce((sum, a) => sum + (a.time_spent || 0), 0) / completed.length / 60)
            : 0,
        passRate: completed.length > 0
            ? Math.round((completed.filter(a => a.score >= (this.test?.passing_score || 70)).length / completed.length) * 100)
            : 0
      }
    },

    calculateDailyStats() {
      const last7Days = []
      const today = new Date()

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const dayAttempts = this.attempts.filter(a =>
            a.started_at && a.started_at.startsWith(dateStr)
        )

        const max = Math.max(...this.attempts.map(a => a.started_at ? 1 : 0), 1)
        const percentage = dayAttempts.length > 0
            ? Math.round((dayAttempts.length / max) * 100)
            : 0

        last7Days.push({
          date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          count: dayAttempts.length,
          percentage: Math.min(percentage, 100)
        })
      }

      this.dailyStats = last7Days
    },

    calculateGrades() {
      const completed = this.attempts.filter(a => a.status === 'completed')
      if (completed.length === 0) return

      const excellent = completed.filter(a => a.score >= 85).length
      const good = completed.filter(a => a.score >= 70 && a.score < 85).length
      const satisfactory = completed.filter(a => a.score >= 50 && a.score < 70).length
      const poor = completed.filter(a => a.score < 50).length

      this.grades = {
        excellent: Math.round((excellent / completed.length) * 100),
        good: Math.round((good / completed.length) * 100),
        satisfactory: Math.round((satisfactory / completed.length) * 100),
        poor: Math.round((poor / completed.length) * 100)
      }
    },

    calculateGroupStats() {
      const groupMap = new Map()

      this.attempts.forEach(attempt => {
        const student = this.students.get(attempt.user_id)
        if (!student) return

        const group = student.group || 'Без группы'
        if (!groupMap.has(group)) {
          groupMap.set(group, {
            name: group,
            students: new Set(),
            completed: 0,
            totalScore: 0
          })
        }

        const groupStat = groupMap.get(group)
        groupStat.students.add(attempt.user_id)

        if (attempt.status === 'completed' && attempt.score) {
          groupStat.completed++
          groupStat.totalScore += attempt.score
        }
      })

      this.groupStats = Array.from(groupMap.values()).map(g => ({
        name: g.name,
        students: g.students.size,
        completed: g.completed,
        avgScore: g.completed > 0 ? Math.round(g.totalScore / g.completed) : 0,
        passRate: g.completed > 0
            ? Math.round((g.completed / g.students.size) * 100)
            : 0
      }))
    },

    calculateQuestionsAnalysis() {
      // Для каждого вопроса нужно собрать статистику по ответам
      // Это сложный запрос, для демо используем заглушки
      this.questionsAnalysis = this.questions.map((q, index) => ({
        id: q.id,
        text: q.text,
        difficulty: q.difficulty || 'medium',
        correctAnswers: Math.floor(Math.random() * 40) + 50, // Заглушка
        avgTime: Math.floor(Math.random() * 30) + 20, // Заглушка
        options: (q.options || []).map((opt, optIndex) => ({
          text: opt.text,
          percent: opt.is_correct
              ? Math.floor(Math.random() * 30) + 60
              : Math.floor(Math.random() * 30),
          correct: opt.is_correct
        }))
      }))
    },

    calculateStudentResults() {
      this.studentResults = this.attempts
          .filter(a => a.status === 'completed')
          .map(attempt => {
            const student = this.students.get(attempt.user_id) || { name: 'Студент', group: 'Без группы' }
            const passed = attempt.score >= (this.test?.passing_score || 70)

            return {
              id: attempt.id,
              studentName: student.name,
              group: student.group,
              score: attempt.score || 0,
              maxScore: 100,
              percentage: attempt.score || 0,
              passed,
              timeSpent: attempt.time_spent || 0,
              date: attempt.completed_at || attempt.started_at
            }
          })
    },

    calculateScoreRanges() {
      const completed = this.attempts.filter(a => a.status === 'completed')
      const ranges = [
        { label: '90-100%', min: 90, max: 100, count: 0 },
        { label: '80-89%', min: 80, max: 89, count: 0 },
        { label: '70-79%', min: 70, max: 79, count: 0 },
        { label: '60-69%', min: 60, max: 69, count: 0 },
        { label: '50-59%', min: 50, max: 59, count: 0 },
        { label: '<50%', min: 0, max: 49, count: 0 }
      ]

      completed.forEach(a => {
        const score = a.score || 0
        const range = ranges.find(r => score >= r.min && score <= r.max)
        if (range) range.count++
      })

      const total = completed.length
      this.scoreRanges = ranges.map(r => ({
        ...r,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
      }))
    },

    calculateTimeStats() {
      const times = this.attempts
          .filter(a => a.status === 'completed' && a.time_spent)
          .map(a => Math.round(a.time_spent / 60))

      if (times.length === 0) return

      times.sort((a, b) => a - b)

      this.timeStats = {
        min: times[0],
        max: times[times.length - 1],
        avg: Math.round(times.reduce((sum, t) => sum + t, 0) / times.length),
        median: times[Math.floor(times.length / 2)]
      }
    },

    calculateDifficultyStats() {
      // В реальном проекте нужно анализировать проценты правильных ответов
      // Для демо используем случайные числа
      this.difficultyStats = {
        easy: this.questions.filter(q => q.difficulty === 'easy').length,
        medium: this.questions.filter(q => q.difficulty === 'intermediate').length,
        hard: this.questions.filter(q => q.difficulty === 'advanced').length
      }
    },

    exportReports() {
      this.exporting = true

      // Формируем данные для экспорта
      const exportData = {
        test: this.test,
        stats: this.stats,
        attempts: this.attempts,
        studentResults: this.studentResults,
        questionsAnalysis: this.questionsAnalysis,
        exportDate: new Date().toISOString()
      }

      // Создаем и скачиваем JSON файл
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `test_${this.testId}_reports_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setTimeout(() => {
        this.exporting = false
      }, 1000)
    },

    backToTests() {
      this.$router.push('/teacher/tests')
    },

    difficultyLabel(difficulty) {
      const labels = {
        easy: 'Легкий',
        intermediate: 'Средний',
        advanced: 'Сложный',
        beginner: 'Начальный'
      }
      return labels[difficulty] || difficulty
    },

    formatTime(seconds) {
      if (!seconds) return '—'
      const mins = Math.floor(seconds / 60)
      return `${mins} мин`
    },

    formatDate(date) {
      if (!date) return '—'
      const d = new Date(date)
      return d.toLocaleDateString('ru-RU')
    },

    viewDetailedResult(id) {
      this.$router.push(`/teacher/result/${id}`)
    }
  }
}
</script>

<style scoped>
.test-reports {
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

.reports-main {
  padding: 120px 0 60px;
  flex: 1;
}

/* Состояния загрузки и ошибок */
.loading-state,
.error-state,
.empty-state {
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

.no-data-message {
  padding: 40px;
  text-align: center;
  color: #999;
  background: #f5f5f5;
  border: 1px solid #eee;
}

/* Хлебные крошки */
.breadcrumbs {
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: #111;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb-current {
  color: #111;
  font-weight: 500;
}

/* Заголовок */
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.reports-title {
  font-size: 2rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin: 0;
}

/* Общая статистика */
.overall-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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

/* Табы */
.reports-tabs {
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

/* График */
.chart-section {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  margin-bottom: 32px;
}

.chart-section h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.chart-container {
  height: 200px;
}

.mini-chart {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
}

.chart-column {
  width: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-bar {
  width: 20px;
  background: #111;
  margin-bottom: 8px;
  transition: height 0.3s;
}

.chart-label {
  font-size: 0.75rem;
  color: #999;
}

/* Распределение оценок */
.grades-section {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  margin-bottom: 32px;
}

.grades-section h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.grades-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grade-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.grade-label {
  width: 120px;
  font-size: 0.9rem;
  color: #666;
}

.grade-bar {
  flex: 1;
  height: 24px;
  background: #f5f5f5;
}

.grade-fill {
  height: 100%;
  transition: width 0.3s;
}

.grade-fill.excellent {
  background: #4caf50;
}

.grade-fill.good {
  background: #2196f3;
}

.grade-fill.satisfactory {
  background: #ff9800;
}

.grade-fill.poor {
  background: #f44336;
}

.grade-value {
  width: 60px;
  font-size: 0.9rem;
  color: #666;
  text-align: right;
}

/* Статистика по группам */
.groups-section {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
}

.groups-section h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.groups-table {
  width: 100%;
  border-collapse: collapse;
}

.groups-table th {
  text-align: left;
  padding: 12px 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #999;
  border-bottom: 1px solid #eee;
}

.groups-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f5f5f5;
}

.progress-small {
  width: 100px;
  height: 6px;
  background: #f5f5f5;
}

.progress-fill {
  height: 100%;
  background: #111;
  transition: width 0.3s;
}

/* Анализ вопросов */
.questions-analysis {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-analysis-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.question-number {
  font-weight: 500;
  color: #666;
}

.question-difficulty {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  border: 1px solid;
}

.question-difficulty.easy {
  border-color: #4caf50;
  color: #2e7d32;
}

.question-difficulty.intermediate,
.question-difficulty.medium {
  border-color: #ff9800;
  color: #f57c00;
}

.question-difficulty.advanced {
  border-color: #f44336;
  color: #c62828;
}

.question-text {
  font-size: 1rem;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.question-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  gap: 8px;
  color: #666;
}

.answers-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-dist {
  display: flex;
  align-items: center;
  gap: 12px;
}

.answer-letter {
  width: 24px;
  height: 24px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 500;
}

.answer-text {
  width: 200px;
  font-size: 0.9rem;
}

.answer-percent {
  width: 48px;
  font-size: 0.9rem;
  color: #666;
}

.dist-bar {
  flex: 1;
  height: 20px;
  background: #f5f5f5;
}

.dist-fill {
  height: 100%;
  background: #999;
  transition: width 0.3s;
}

.dist-fill.correct {
  background: #4caf50;
}

/* Таблица результатов студентов */
.students-filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.students-results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #eee;
}

.students-results-table th {
  text-align: left;
  padding: 16px 12px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #999;
  border-bottom: 1px solid #eee;
}

.students-results-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f5f5f5;
}

.status-badge {
  padding: 2px 8px;
  font-size: 0.85rem;
}

.status-badge.passed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.failed {
  background: #ffebee;
  color: #c62828;
}

/* Распределение */
.distribution-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.distribution-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
}

.distribution-card h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.histogram {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.histogram-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-label {
  width: 60px;
  font-size: 0.85rem;
  color: #666;
}

.range-bar {
  flex: 1;
  height: 20px;
  background: #f5f5f5;
}

.range-fill {
  height: 100%;
  background: #111;
  transition: width 0.3s;
}

.range-value {
  width: 80px;
  font-size: 0.85rem;
  color: #666;
  text-align: right;
}

.time-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-stat {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.time-label {
  color: #666;
}

.time-value {
  font-weight: 500;
}

.difficulty-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.difficulty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-label {
  color: #666;
}

.difficulty-value {
  font-weight: 500;
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

.btn-outline {
  background: transparent;
  color: #111;
  border-color: #ddd;
}

.btn-outline:hover:not(:disabled) {
  border-color: #111;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Поиск */
.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #111;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .overall-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .distribution-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .reports-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .overall-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .reports-tabs {
    flex-wrap: wrap;
  }

  .students-filters {
    grid-template-columns: 1fr;
  }

  .distribution-grid {
    grid-template-columns: 1fr;
  }

  .students-results-table {
    display: block;
    overflow-x: auto;
  }

  .grade-item {
    flex-wrap: wrap;
  }

  .grade-label {
    width: 100%;
  }

  .answer-dist {
    flex-wrap: wrap;
  }

  .answer-text {
    width: 100%;
  }
}
</style>