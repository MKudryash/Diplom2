<template>
  <div class="test-results">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="results-main">
      <div class="container">
        <!-- Хлебные крошки -->
        <div class="breadcrumbs">
          <a href="/tests" class="breadcrumb-link">Каталог тестов</a>
          <span class="breadcrumb-separator">/</span>
          <a :href="`/test/${testId}`" class="breadcrumb-link">{{ test.title }}</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Результаты</span>
        </div>

        <!-- Заголовок -->
        <div class="results-header">
          <h1 class="results-title">{{ test.title }}</h1>
          <p class="results-subtitle">Результаты тестирования</p>
        </div>

        <!-- Основные показатели -->
        <div class="score-overview">
          <div class="score-card main-score">
            <div class="score-circle" :style="{ '--percentage': result.scorePercentage }">
              <div class="circle-inner">
                <span class="score-value">{{ result.scorePercentage }}%</span>
                <span class="score-label">общий результат</span>
              </div>
            </div>
          </div>

          <div class="score-stats-grid">
            <div class="stat-card">
              <span class="stat-icon">✓</span>
              <div class="stat-content">
                <span class="stat-value">{{ result.correctAnswers }}/{{ result.totalQuestions }}</span>
                <span class="stat-label">правильных ответов</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">⏱️</span>
              <div class="stat-content">
                <span class="stat-value">{{ formatTime(result.timeSpent) }}</span>
                <span class="stat-label">время выполнения</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">⚑</span>
              <div class="stat-content">
                <span class="stat-value">{{ result.flaggedCount || 0 }}</span>
                <span class="stat-label">отмеченных вопросов</span>
              </div>
            </div>

            <div class="stat-card" :class="{ 'success': result.passed, 'fail': !result.passed }">
              <span class="stat-icon">{{ result.passed ? '🏆' : '📝' }}</span>
              <div class="stat-content">
                <span class="stat-value">{{ result.passed ? 'Пройден' : 'Не пройден' }}</span>
                <span class="stat-label">проходной балл {{ test.passingScore }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Детальная статистика -->
        <div class="detailed-stats">
          <h2 class="section-title">Детальная статистика</h2>

          <div class="stats-breakdown">
            <div class="breakdown-item">
              <span class="breakdown-label">Всего вопросов:</span>
              <span class="breakdown-value">{{ result.totalQuestions }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Правильных ответов:</span>
              <span class="breakdown-value correct">{{ result.correctAnswers }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Неправильных ответов:</span>
              <span class="breakdown-value incorrect">{{ result.incorrectAnswers }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Пропущено вопросов:</span>
              <span class="breakdown-value skipped">{{ result.skippedAnswers }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Точность:</span>
              <span class="breakdown-value">{{ result.accuracy }}%</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Затрачено времени:</span>
              <span class="breakdown-value">{{ formatTime(result.timeSpent) }}</span>
            </div>
          </div>
        </div>

        <!-- Распределение по категориям (если есть) -->
        <div v-if="categories.length" class="categories-section">
          <h2 class="section-title">Результаты по темам</h2>

          <div class="categories-grid">
            <div v-for="cat in categories" :key="cat.name" class="category-card">
              <div class="category-header">
                <h3 class="category-name">{{ cat.name }}</h3>
                <span class="category-score">{{ cat.correct }}/{{ cat.total }}</span>
              </div>
              <div class="category-progress">
                <div class="progress-bar">
                  <div
                      class="progress-fill"
                      :style="{ width: cat.percentage + '%' }"
                      :class="{ 'low': cat.percentage < 50, 'medium': cat.percentage >= 50 && cat.percentage < 80, 'high': cat.percentage >= 80 }"
                  ></div>
                </div>
                <span class="category-percentage">{{ cat.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="results-actions">
          <button @click="reviewTest" class="btn btn-primary btn-large">
            Разобрать ошибки
          </button>
          <button @click="retakeTest" class="btn btn-outline btn-large">
            Пройти заново
          </button>
          <button @click="backToCatalog" class="btn btn-link">
            Вернуться к каталогу
          </button>
        </div>

        <!-- Информация о сертификате (если тест пройден) -->
        <div v-if="result.passed" class="certificate-note">
          <p>🎉 Поздравляем! Вы успешно прошли тест.</p>
          <button @click="downloadCertificate" class="btn btn-outline">
            Скачать сертификат
          </button>
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
  name: 'TestResults',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      testId: null,
      test: {
        id: 1,
        title: 'Основы JavaScript',
        passingScore: 70
      },
      result: {
        scorePercentage: 84,
        correctAnswers: 21,
        incorrectAnswers: 3,
        skippedAnswers: 1,
        totalQuestions: 25,
        timeSpent: 1380, // в секундах
        flaggedCount: 2,
        passed: true,
        accuracy: 84
      },
      categories: [
        { name: 'Переменные и типы', correct: 5, total: 6, percentage: 83 },
        { name: 'Функции', correct: 7, total: 8, percentage: 88 },
        { name: 'Объекты и массивы', correct: 4, total: 5, percentage: 80 },
        { name: 'Асинхронность', correct: 3, total: 4, percentage: 75 },
        { name: 'Ошибки и исключения', correct: 2, total: 2, percentage: 100 }
      ]
    }
  },
  created() {
    this.testId = this.$route.params.id
    this.loadResults()
  },
  methods: {
    loadResults() {
      // Загружаем результаты из localStorage или API
      const saved = localStorage.getItem(`test_result_${this.testId}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          this.result = { ...this.result, ...data }
        } catch (e) {
          console.error('Failed to load results:', e)
        }
      }
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins} мин ${secs} сек`
    },

    reviewTest() {
      this.$router.push(`/test/${this.testId}/review`)
    },

    retakeTest() {
      // Очищаем сохраненные ответы
      localStorage.removeItem(`test_${this.testId}`)
      localStorage.removeItem(`test_result_${this.testId}`)
      this.$router.push(`/test/${this.testId}/take`)
    },

    backToCatalog() {
      this.$router.push('/tests')
    },

    downloadCertificate() {
      console.log('Downloading certificate...')
      // Здесь будет логика скачивания сертификата
    }
  }
}
</script>

<style scoped>
.test-results {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Хлебные крошки */
.breadcrumbs {
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
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

/* Основной контент */
.results-main {
  padding: 120px 0 60px;
  flex: 1;
}

.results-header {
  text-align: center;
  margin-bottom: 48px;
}

.results-title {
  font-size: 2.5rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  line-height: 1.2;
}

.results-subtitle {
  color: #666;
  font-size: 1rem;
}

/* Общий результат */
.score-overview {
  margin-bottom: 48px;
}

.score-card.main-score {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(#111 0% var(--percentage), #eee var(--percentage) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circle-inner {
  width: 160px;
  height: 160px;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 3rem;
  font-weight: 450;
  line-height: 1;
  margin-bottom: 4px;
}

.score-label {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Сетка статистики */
.score-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border: 1px solid #eee;
}

.stat-card.success {
  border-color: #4caf50;
}

.stat-card.fail {
  border-color: #f44336;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 450;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Детальная статистика */
.detailed-stats {
  background: white;
  border: 1px solid #eee;
  padding: 32px;
  margin-bottom: 48px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.stats-breakdown {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.breakdown-label {
  color: #666;
  font-size: 0.95rem;
}

.breakdown-value {
  font-weight: 500;
}

.breakdown-value.correct {
  color: #4caf50;
}

.breakdown-value.incorrect {
  color: #f44336;
}

.breakdown-value.skipped {
  color: #ff9800;
}

/* Категории */
.categories-section {
  background: white;
  border: 1px solid #eee;
  padding: 32px;
  margin-bottom: 48px;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-card {
  padding: 16px;
  border: 1px solid #f5f5f5;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-name {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.category-score {
  font-size: 0.95rem;
  color: #666;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.low {
  background: #f44336;
}

.progress-fill.medium {
  background: #ff9800;
}

.progress-fill.high {
  background: #4caf50;
}

.category-percentage {
  min-width: 48px;
  font-size: 0.9rem;
  color: #666;
  text-align: right;
}

/* Кнопки действий */
.results-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
  background: none;
  text-align: center;
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

.btn-link {
  color: #666;
  text-decoration: underline;
  text-underline-offset: 4px;
  border: none;
}

.btn-link:hover {
  color: #111;
}

.btn-large {
  padding: 14px 32px;
  font-size: 1rem;
}

/* Сертификат */
.certificate-note {
  text-align: center;
  padding: 24px;
  background: #f5f5f5;
  border: 1px solid #eee;
}

.certificate-note p {
  margin-bottom: 16px;
  color: #4caf50;
}

/* Адаптивность */
@media (max-width: 768px) {
  .results-title {
    font-size: 2rem;
  }

  .score-stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-breakdown {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
  }

  .btn-large {
    width: 100%;
  }
}
</style>