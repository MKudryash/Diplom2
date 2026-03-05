<template>
  <div class="test-results">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="results-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка результатов...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">
            <i class="fas fa-times-circle"></i>
          </p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="backToCatalog" class="btn btn-primary">
            Вернуться к каталогу
          </button>
        </div>

        <!-- Результаты не найдены -->
        <div v-else-if="!attempt" class="empty-state">
          <p class="empty-icon">
            <i class="fas fa-chart-bar"></i>
          </p>
          <h3>Результаты не найдены</h3>
          <p>У вас нет завершенных попыток этого теста</p>
          <button @click="backToCatalog" class="btn btn-primary">
            Вернуться к каталогу
          </button>
        </div>

        <template v-else>
          <!-- Хлебные крошки -->
          <div class="breadcrumbs">
            <a href="/tests" class="breadcrumb-link">Каталог тестов</a>
            <span class="breadcrumb-separator">/</span>
            <a :href="`/test/${testId}`" class="breadcrumb-link">{{ test?.title || 'Тест' }}</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">Результаты</span>
          </div>

          <!-- Заголовок -->
          <div class="results-header">
            <h1 class="results-title">{{ test?.title || 'Тест' }}</h1>
            <p class="results-subtitle">Результаты тестирования</p>
          </div>

          <!-- Основные показатели -->
          <div class="score-overview">
            <div class="score-card main-score">
              <div class="score-circle" :style="{ '--percentage': attempt.score || 0 }">
                <div class="circle-inner">
                  <span class="score-value">{{ attempt.score || 0 }}%</span>
                  <span class="score-label">общий результат</span>
                </div>
              </div>
            </div>

            <div class="score-stats-grid">
              <div class="stat-card">
        <span class="stat-icon">
            <i class="fas fa-check-circle"></i>
        </span>
                <div class="stat-content">
                  <span class="stat-value">{{ attempt.correct_answers || 0 }}/{{ attempt.total_questions || 0 }}</span>
                  <span class="stat-label">правильных ответов</span>
                </div>
              </div>

              <div class="stat-card">
        <span class="stat-icon">
            <i class="fas fa-clock"></i>
        </span>
                <div class="stat-content">
                  <span class="stat-value">{{ formatTime(attempt.time_spent || 0) }}</span>
                  <span class="stat-label">время выполнения</span>
                </div>
              </div>

              <div class="stat-card">
        <span class="stat-icon">
            <i class="fas fa-flag"></i>
        </span>
                <div class="stat-content">
                  <span class="stat-value">{{ flaggedCount }}</span>
                  <span class="stat-label">отмеченных вопросов</span>
                </div>
              </div>

              <div class="stat-card" :class="{ 'success': isPassed, 'fail': !isPassed }">
        <span class="stat-icon">
            <i :class="isPassed ? 'fas fa-trophy' : 'fas fa-pencil-alt'"></i>
        </span>
                <div class="stat-content">
                  <span class="stat-value">{{ isPassed ? 'Пройден' : 'Не пройден' }}</span>
                  <span class="stat-label">проходной балл {{ test?.passing_score || 70 }}%</span>
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
                <span class="breakdown-value">{{ attempt.total_questions || 0 }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Правильных ответов:</span>
                <span class="breakdown-value correct">{{ attempt.correct_answers || 0 }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Неправильных ответов:</span>
                <span class="breakdown-value incorrect">{{ incorrectAnswers }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Пропущено вопросов:</span>
                <span class="breakdown-value skipped">{{ skippedAnswers }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Точность:</span>
                <span class="breakdown-value">{{ accuracy }}%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Затрачено времени:</span>
                <span class="breakdown-value">{{ formatTime(attempt.time_spent || 0) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Дата завершения:</span>
                <span class="breakdown-value">{{ formatDate(attempt.completed_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Распределение по категориям (если есть) -->
          <div v-if="categories.length > 0" class="categories-section">
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
          <div v-if="isPassed" class="certificate-note">
            <p>🎉 Поздравляем! Вы успешно прошли тест.</p>
            <button @click="downloadCertificate" class="btn btn-outline">
              Скачать сертификат
            </button>
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
  name: 'TestResults',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      testId: null,
      attemptId: null,
      loading: true,
      error: null,

      test: null,
      attempt: null,
      answers: [],
      questions: [],
      categories: [],

      flaggedCount: 0
    }
  },
  computed: {
    isPassed() {
      if (!this.attempt || !this.test) return false
      return (this.attempt.score || 0) >= (this.test.passing_score || 70)
    },

    incorrectAnswers() {
      if (!this.attempt) return 0
      return (this.attempt.total_questions || 0) - (this.attempt.correct_answers || 0)
    },

    skippedAnswers() {
      if (!this.attempt || !this.questions.length) return 0
      const answeredQuestions = new Set(this.answers.map(a => a.question_id))
      return this.questions.length - answeredQuestions.size
    },

    accuracy() {
      if (!this.attempt || !this.attempt.total_questions) return 0
      return Math.round((this.attempt.correct_answers / this.attempt.total_questions) * 100)
    }
  },
  async created() {
    this.testId = this.$route.params.id
    await this.loadResults()
  },
  methods: {
    async loadResults() {
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

        // Сначала пробуем загрузить из localStorage (для несохраненных результатов)
        const savedResult = localStorage.getItem(`test_result_${this.testId}`)
        if (savedResult) {
          try {
            const localData = JSON.parse(savedResult)
            // Используем локальные данные, если они есть
            this.attempt = {
              score: localData.score || 0,
              correct_answers: localData.correct || 0,
              total_questions: localData.totalQuestions || 0,
              time_spent: localData.timeSpent || 0,
              completed_at: new Date().toISOString()
            }

            // Загружаем информацию о тесте
            await this.loadTestInfo()

            // Загружаем вопросы
            await this.loadQuestions()

            this.loading = false
            return
          } catch (e) {
            console.warn('Failed to parse local results:', e)
          }
        }

        // Если нет локальных данных, загружаем из БД
        // Получаем последнюю завершенную попытку
        const { data: attempts, error: attemptsError } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('test_id', this.testId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)

        if (attemptsError) throw attemptsError

        if (!attempts || attempts.length === 0) {
          // Если нет завершенных попыток, проверяем есть ли незавершенные
          const { data: inProgressAttempt, error: inProgressError } = await supabase
              .from('attempts')
              .select('*')
              .eq('user_id', user.id)
              .eq('test_id', this.testId)
              .eq('status', 'in_progress')
              .maybeSingle()

          if (inProgressError) throw inProgressError

          if (inProgressAttempt) {
            // Если есть незавершенная попытка, предлагаем завершить
            this.$router.push(`/test/${this.testId}/take`)
            return
          }

          // Если попыток нет, показываем пустое состояние
          this.attempt = null
          this.loading = false
          return
        }

        this.attempt = attempts[0]
        this.attemptId = this.attempt.id

        // Загружаем информацию о тесте
        await this.loadTestInfo()

        // Загружаем вопросы
        await this.loadQuestions()

        // Загружаем ответы пользователя
        await this.loadAnswers()

        // Загружаем количество отмеченных вопросов из localStorage
        this.loadFlaggedCount()

        // Генерируем категории (если есть информация о категориях вопросов)
        await this.generateCategories()

      } catch (error) {
        console.error('Error loading results:', error)
        this.error = error.message || 'Не удалось загрузить результаты'
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
        console.error('Error loading test info:', error)
        this.test = {
          id: this.testId,
          title: 'Тест',
          passing_score: 70
        }
      }
    },

    async loadQuestions() {
      try {
        const { data, error } = await supabase
            .from('questions')
            .select(`
              id,
              text,
              type,
              difficulty,
              options (*)
            `)
            .eq('test_id', this.testId)
            .order('order', { ascending: true })
console.log(data)
        if (error) throw error
        this.questions = data || []
      } catch (error) {
        console.log('asldkfm')
        console.error('Error loading questions:', error)
        this.questions = []
      }
    },

    async loadAnswers() {
      if (!this.attemptId) return

      try {
        const { data, error } = await supabase
            .from('answers')
            .select('*')
            .eq('attempt_id', this.attemptId)

        if (error) throw error
        this.answers = data || []
      } catch (error) {
        console.error('Error loading answers:', error)
        this.answers = []
      }
    },

    loadFlaggedCount() {
      try {
        const saved = localStorage.getItem(`test_${this.testId}`)
        if (saved) {
          const state = JSON.parse(saved)
          this.flaggedCount = state.flaggedQuestions?.length || 0
        }
      } catch (e) {
        console.warn('Failed to load flagged count:', e)
        this.flaggedCount = 0
      }
    },

    async generateCategories() {
      // Группируем вопросы по категориям
      const categoryMap = new Map()

      this.questions.forEach(question => {
        const category = question.category || 'Без категории'
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category,
            total: 0,
            correct: 0
          })
        }

        const cat = categoryMap.get(category)
        cat.total++

        // Проверяем, правильный ли ответ на этот вопрос
        const answer = this.answers.find(a => a.question_id === question.id)
        if (answer?.is_correct) {
          cat.correct++
        }
      })

      // Преобразуем в массив и вычисляем проценты
      this.categories = Array.from(categoryMap.values()).map(cat => ({
        ...cat,
        percentage: Math.round((cat.correct / cat.total) * 100) || 0
      }))
    },

    formatTime(seconds) {
      if (!seconds) return '0 мин 0 сек'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins} мин ${secs} сек`
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    reviewTest() {
      this.$router.push(`/test/${this.testId}/reports`)
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

    async downloadCertificate() {
      try {
        // Получаем информацию о пользователе
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Получаем профиль пользователя
        const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()

        // Формируем данные для сертификата
        const certificateData = {
          studentName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Студент',
          testName: this.test?.title || 'Тест',
          score: this.attempt?.score || 0,
          date: this.formatDate(this.attempt?.completed_at),
          certificateId: `CERT-${this.testId}-${Date.now()}`
        }

        console.log('Downloading certificate:', certificateData)

        // Здесь будет реальная генерация PDF
        alert('Функция скачивания сертификата будет доступна в ближайшее время')

      } catch (error) {
        console.error('Error generating certificate:', error)
        alert('Не удалось сгенерировать сертификат')
      }
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