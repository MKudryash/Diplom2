<template>
  <div class="test-reports">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <main class="reports-main">
      <div class="container">
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
            <button @click="exportReports" class="btn btn-outline">
              📊 Экспорт отчетов
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
            <span class="stat-label">Проходной %</span>
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
              <div class="mini-chart">
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
            <table class="groups-table">
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
          </div>
        </div>

        <!-- Вкладка: Анализ вопросов -->
        <div v-if="activeTab === 'questions'" class="questions-tab">
          <div class="questions-analysis">
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
              <option v-for="group in groups" :key="group">{{ group }}</option>
            </select>

            <select v-model="statusFilter" class="filter-select">
              <option value="all">Все статусы</option>
              <option value="passed">Пройдено</option>
              <option value="failed">Не пройдено</option>
            </select>
          </div>

          <table class="students-results-table">
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
              <div class="histogram">
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

      test: {
        id: 1,
        title: 'Основы JavaScript'
      },

      stats: {
        totalAttempts: 156,
        completedAttempts: 142,
        averageScore: 74,
        averageTime: 28,
        passRate: 68
      },

      dailyStats: [
        { date: '15.03', count: 12, percentage: 60 },
        { date: '16.03', count: 18, percentage: 90 },
        { date: '17.03', count: 15, percentage: 75 },
        { date: '18.03', count: 22, percentage: 100 },
        { date: '19.03', count: 16, percentage: 80 },
        { date: '20.03', count: 14, percentage: 70 },
        { date: '21.03', count: 20, percentage: 95 }
      ],

      grades: {
        excellent: 28,
        good: 34,
        satisfactory: 24,
        poor: 14
      },

      groups: ['ПИ-201', 'ПИ-202', 'ПИ-301'],

      groupStats: [
        { name: 'ПИ-201', students: 28, completed: 24, avgScore: 78, passRate: 75 },
        { name: 'ПИ-202', students: 25, completed: 22, avgScore: 72, passRate: 68 },
        { name: 'ПИ-301', students: 24, completed: 20, avgScore: 81, passRate: 82 }
      ],

      questionsAnalysis: [
        {
          id: 1,
          text: 'Какое ключевое слово используется для объявления переменной?',
          difficulty: 'easy',
          correctAnswers: 85,
          avgTime: 45,
          options: [
            { text: 'var', percent: 85, correct: true },
            { text: 'let', percent: 10, correct: false },
            { text: 'const', percent: 3, correct: false },
            { text: 'function', percent: 2, correct: false }
          ]
        },
        {
          id: 2,
          text: 'Что выведет console.log(typeof [])?',
          difficulty: 'medium',
          correctAnswers: 62,
          avgTime: 38,
          options: [
            { text: 'array', percent: 30, correct: false },
            { text: 'object', percent: 62, correct: true },
            { text: 'undefined', percent: 5, correct: false },
            { text: 'null', percent: 3, correct: false }
          ]
        }
      ],

      studentResults: [
        { id: 1, studentName: 'Алексей Иванов', group: 'ПИ-201', score: 22, maxScore: 25, percentage: 88, passed: true, timeSpent: 1420, date: '2026-03-21' },
        { id: 2, studentName: 'Мария Петрова', group: 'ПИ-201', score: 24, maxScore: 25, percentage: 96, passed: true, timeSpent: 1250, date: '2026-03-21' },
        { id: 3, studentName: 'Дмитрий Сидоров', group: 'ПИ-201', score: 15, maxScore: 25, percentage: 60, passed: false, timeSpent: 1850, date: '2026-03-20' },
        { id: 4, studentName: 'Игорь Смирнов', group: 'ПИ-202', score: 18, maxScore: 25, percentage: 72, passed: true, timeSpent: 1620, date: '2026-03-20' }
      ],

      scoreRanges: [
        { label: '90-100%', count: 18, percentage: 13 },
        { label: '80-89%', count: 32, percentage: 23 },
        { label: '70-79%', count: 38, percentage: 27 },
        { label: '60-69%', count: 24, percentage: 17 },
        { label: '50-59%', count: 16, percentage: 11 },
        { label: '<50%', count: 12, percentage: 9 }
      ],

      timeStats: {
        min: 15,
        max: 45,
        avg: 28,
        median: 26
      },

      difficultyStats: {
        easy: 8,
        medium: 12,
        hard: 5
      }
    }
  },
  computed: {
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
  created() {
    this.testId = this.$route.params.id
    this.loadReports()
  },
  methods: {
    loadReports() {
      console.log('Loading reports for test:', this.testId)
    },

    exportReports() {
      console.log('Exporting reports...')
    },

    difficultyLabel(difficulty) {
      const labels = {
        easy: 'Легкий',
        medium: 'Средний',
        hard: 'Сложный'
      }
      return labels[difficulty] || difficulty
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      return `${mins} мин`
    },

    formatDate(date) {
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

.question-difficulty.medium {
  border-color: #ff9800;
  color: #f57c00;
}

.question-difficulty.hard {
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

.btn-outline:hover {
  border-color: #111;
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