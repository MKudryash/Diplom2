<template>
  <div class="test-review">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="review-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка данных...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">❌</p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="backToResults" class="btn btn-primary">
            Вернуться к результатам
          </button>
        </div>

        <!-- Нет данных -->
        <div v-else-if="!attempt || questions.length === 0" class="empty-state">
          <p class="empty-icon">📊</p>
          <h3>Данные не найдены</h3>
          <p>Не удалось загрузить информацию о тесте</p>
          <button @click="backToResults" class="btn btn-primary">
            Вернуться к результатам
          </button>
        </div>

        <template v-else>
          <!-- Хлебные крошки -->
          <div class="breadcrumbs">
            <a href="/tests" class="breadcrumb-link">Каталог тестов</a>
            <span class="breadcrumb-separator">/</span>
            <a :href="`/test/${testId}`" class="breadcrumb-link">{{ test?.title || 'Тест' }}</a>
            <span class="breadcrumb-separator">/</span>
            <a :href="`/test/${testId}/results`" class="breadcrumb-link">Результаты</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">Разбор ошибок</span>
          </div>

          <!-- Заголовок -->
          <div class="review-header">
            <h1 class="review-title">Разбор ошибок</h1>
            <p class="review-subtitle">
              {{ correctCount }} правильно, {{ incorrectCount }} ошибок, {{ skippedCount }} пропущено
            </p>
          </div>

          <!-- Фильтры -->
          <div class="review-filters">
            <button
                class="filter-btn"
                :class="{ active: filter === 'all' }"
                @click="filter = 'all'"
            >
              Все вопросы ({{ questions.length }})
            </button>
            <button
                class="filter-btn"
                :class="{ active: filter === 'incorrect' }"
                @click="filter = 'incorrect'"
            >
              С ошибками ({{ incorrectCount }})
            </button>
            <button
                class="filter-btn"
                :class="{ active: filter === 'correct' }"
                @click="filter = 'correct'"
            >
              Правильные ({{ correctCount }})
            </button>
            <button
                class="filter-btn"
                :class="{ active: filter === 'skipped' }"
                @click="filter = 'skipped'"
            >
              Пропущенные ({{ skippedCount }})
            </button>
          </div>

          <!-- Список вопросов с разбором -->
          <div class="questions-review">
            <div
                v-for="(question, index) in filteredQuestions"
                :key="question.id"
                class="review-card"
                :class="{
                  'correct': question.status === 'correct',
                  'incorrect': question.status === 'incorrect',
                  'skipped': question.status === 'skipped'
                }"
            >
              <!-- Заголовок вопроса -->
              <div class="review-card-header">
                <div class="question-number">
                  <span class="number">Вопрос {{ index + 1 }}</span>
                  <span class="status-badge" :class="question.status">
                    {{ statusLabel(question.status) }}
                  </span>
                </div>
                <button
                    class="toggle-details"
                    @click="toggleQuestion(index)"
                >
                  {{ expandedQuestions[index] ? 'Скрыть' : 'Показать разбор' }}
                </button>
              </div>

              <!-- Текст вопроса -->
              <div class="question-text">
                {{ question.text }}
              </div>

              <!-- Детали (показываются при раскрытии) -->
              <div v-if="expandedQuestions[index]" class="question-details">
                <!-- Варианты ответов (для single/multiple) -->
                <div v-if="question.type !== 'text'" class="answers-review">
                  <div
                      v-for="(option, optIndex) in question.options"
                      :key="option.id"
                      class="answer-review"
                      :class="{
                        'correct-answer': isCorrectAnswer(question, option),
                        'user-answer': isUserAnswer(question, option),
                        'wrong-user-answer': isWrongUserAnswer(question, option)
                      }"
                  >
                    <span class="answer-marker">
                      {{ String.fromCharCode(65 + optIndex) }}
                    </span>
                    <span class="answer-text">{{ option.text }}</span>
                    <span v-if="isCorrectAnswer(question, option)" class="answer-icon correct">✓</span>
                    <span v-if="isWrongUserAnswer(question, option)" class="answer-icon wrong">✗</span>
                  </div>
                </div>

                <!-- Текстовый ответ пользователя -->
                <div v-else class="text-answer-review">
                  <div class="user-answer-block">
                    <h4>Ваш ответ:</h4>
                    <p>{{ getUserTextAnswer(question.id) || '—' }}</p>
                  </div>
                </div>

                <!-- Пояснение -->
                <div v-if="question.explanation" class="explanation">
                  <h4>Пояснение</h4>
                  <p>{{ question.explanation }}</p>
                </div>

                <!-- Правильный ответ для текстовых вопросов -->
                <div v-if="question.type === 'text' && question.correctAnswer" class="correct-answer-block">
                  <h4>Правильный ответ:</h4>
                  <p>{{ question.correctAnswer }}</p>
                </div>

                <!-- Дополнительные материалы -->
                <div v-if="question.resources && question.resources.length" class="resources">
                  <h4>Полезные материалы</h4>
                  <ul>
                    <li v-for="(resource, idx) in question.resources" :key="idx">
                      <a :href="resource.link" target="_blank">{{ resource.title }}</a>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Краткая информация (всегда видна) -->
              <div class="question-meta">
                <span class="meta-item">
                  <span class="meta-icon">⏱️</span>
                  {{ question.timeSpent || 0 }} сек
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📚</span>
                  {{ question.category || 'Без категории' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="review-actions">
            <button @click="backToResults" class="btn btn-outline">
              ← Назад к результатам
            </button>
            <button @click="practiceMistakes" class="btn btn-primary" :disabled="incorrectCount === 0">
              Тренировка ошибок ({{ incorrectCount }})
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
  name: 'TestReview',
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
      filter: 'all',
      expandedQuestions: {},

      test: null,
      attempt: null,
      questions: [],
      answers: [],

      // Для текстовых ответов
      textAnswersMap: new Map()
    }
  },
  computed: {
    correctCount() {
      return this.questions.filter(q => q.status === 'correct').length
    },
    incorrectCount() {
      return this.questions.filter(q => q.status === 'incorrect').length
    },
    skippedCount() {
      return this.questions.filter(q => q.status === 'skipped').length
    },
    filteredQuestions() {
      if (this.filter === 'all') return this.questions
      return this.questions.filter(q => q.status === this.filter)
    }
  },
  async created() {
    this.testId = this.$route.params.id
    await this.loadReviewData()
  },
  watch: {
    filteredQuestions() {
      // Сбрасываем expandedQuestions при смене фильтра
      this.expandedQuestions = {}
    }
  },
  methods: {
    async loadReviewData() {
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

        // Сначала пробуем загрузить из localStorage (для только что завершенного теста)
        const savedResult = localStorage.getItem(`test_result_${this.testId}`)
        const savedTest = localStorage.getItem(`test_${this.testId}`)

        if (savedResult && savedTest) {
          await this.loadFromLocalStorage(savedResult, savedTest)
          this.loading = false
          return
        }

        // Если нет в localStorage, загружаем из БД
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
          this.error = 'Нет завершенных попыток этого теста'
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

        // Формируем вопросы для отображения
        this.buildQuestions()

      } catch (error) {
        console.error('Error loading review data:', error)
        this.error = error.message || 'Не удалось загрузить данные'
      } finally {
        this.loading = false
      }
    },

    async loadFromLocalStorage(savedResult, savedTest) {
      try {
        const resultData = JSON.parse(savedResult)
        const testData = JSON.parse(savedTest)

        // Загружаем информацию о тесте из БД для получения полных данных
        await this.loadTestInfo()

        // Загружаем вопросы из БД
        await this.loadQuestions()

        // Восстанавливаем ответы из localStorage
        this.answers = Object.entries(testData.answers || {}).map(([questionId, selected]) => ({
          question_id: questionId,
          answer_data: { selected }
        }))

        Object.entries(testData.textAnswers || {}).forEach(([questionId, text]) => {
          this.textAnswersMap.set(questionId, text)
        })

        // Формируем вопросы
        this.buildQuestions(resultData)

      } catch (e) {
        console.error('Error loading from localStorage:', e)
        throw new Error('Не удалось загрузить данные из локального хранилища')
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
          title: 'Тест'
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
              explanation,
              hint,
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

    buildQuestions(savedResult = null) {
      const resultData = savedResult || {
        correct: this.attempt?.correct_answers || 0,
        totalQuestions: this.attempt?.total_questions || this.questions.length
      }

      // Создаем карту ответов для быстрого доступа
      const answersMap = new Map()
      this.answers.forEach(answer => {
        answersMap.set(answer.question_id, answer)
      })

      // Обогащаем вопросы данными о ответах пользователя
      this.questions = this.questions.map(q => {
        const answer = answersMap.get(q.id)
        let status = 'skipped'
        let userAnswers = null
        let isCorrect = false

        if (answer) {
          if (q.type === 'text') {
            const textAnswer = answer.answer_data?.text || ''
            this.textAnswersMap.set(q.id, textAnswer)
            status = textAnswer ? 'correct' : 'skipped' // Временно, потом нужно добавить проверку текста
            userAnswers = textAnswer
          } else {
            userAnswers = answer.answer_data?.selected

            if (q.type === 'single') {
              const correctOption = q.options.find(o => o.is_correct)
              isCorrect = correctOption && userAnswers === correctOption.id
              status = isCorrect ? 'correct' : 'incorrect'
            } else if (q.type === 'multiple') {
              const correctIds = q.options.filter(o => o.is_correct).map(o => o.id)
              const selectedIds = Array.isArray(userAnswers) ? userAnswers : [userAnswers].filter(Boolean)
              isCorrect = correctIds.length === selectedIds.length &&
                  correctIds.every(id => selectedIds.includes(id))
              status = isCorrect ? 'correct' : 'incorrect'
            }
          }
        }

        return {
          ...q,
          status,
          userAnswers,
          timeSpent: answer ? 30 : 0, // Заглушка, в БД нет времени на вопрос
          resources: [], // Можно добавить позже
          correctAnswer: q.options?.find(o => o.is_correct)?.text
        }
      })
    },

    statusLabel(status) {
      const labels = {
        correct: 'Верно',
        incorrect: 'Ошибка',
        skipped: 'Пропущено'
      }
      return labels[status] || status
    },

    toggleQuestion(index) {
      this.$set(this.expandedQuestions, index, !this.expandedQuestions[index])
    },

    isCorrectAnswer(question, option) {
      return option.is_correct
    },

    isUserAnswer(question, option) {
      if (question.status === 'skipped' || !question.userAnswers) return false

      if (question.type === 'multiple') {
        const selectedIds = Array.isArray(question.userAnswers) ? question.userAnswers : [question.userAnswers]
        return selectedIds.includes(option.id)
      } else {
        return question.userAnswers === option.id
      }
    },

    isWrongUserAnswer(question, option) {
      return this.isUserAnswer(question, option) && !option.is_correct
    },

    getUserTextAnswer(questionId) {
      return this.textAnswersMap.get(questionId) || ''
    },

    backToResults() {
      this.$router.push(`/test/${this.testId}/results`)
    },

    practiceMistakes() {
      // Создаем тест только из ошибочных вопросов
      const mistakeQuestions = this.questions.filter(q => q.status === 'incorrect')

      // Сохраняем в localStorage для тренировки
      localStorage.setItem(`practice_test_${this.testId}`, JSON.stringify({
        questions: mistakeQuestions,
        title: `Тренировка: ${this.test?.title || 'Ошибки'}`
      }))

      // Переходим к тренировке (можно создать отдельный режим)
      alert('Функция тренировки ошибок будет доступна в ближайшее время')
      // this.$router.push(`/test/${this.testId}/practice`)
    }
  }
}
</script>

<style scoped>
.test-review {
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
.review-main {
  padding: 120px 0 60px;
  flex: 1;
}

.review-header {
  text-align: center;
  margin-bottom: 32px;
}

.review-title {
  font-size: 2.5rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  line-height: 1.2;
}

.review-subtitle {
  color: #666;
  font-size: 1rem;
}

/* Фильтры */
.review-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: #111;
}

.filter-btn.active {
  background: #111;
  color: white;
  border-color: #111;
}

/* Карточки вопросов */
.questions-review {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.review-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  transition: all 0.2s;
}

.review-card.correct {
  border-left: 4px solid #4caf50;
}

.review-card.incorrect {
  border-left: 4px solid #f44336;
}

.review-card.skipped {
  border-left: 4px solid #ff9800;
}

.review-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  display: flex;
  align-items: center;
  gap: 12px;
}

.number {
  font-weight: 500;
  color: #666;
}

.status-badge {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
}

.status-badge.correct {
  border-color: #4caf50;
  color: #2e7d32;
}

.status-badge.incorrect {
  border-color: #f44336;
  color: #c62828;
}

.status-badge.skipped {
  border-color: #ff9800;
  color: #f57c00;
}

.toggle-details {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.toggle-details:hover {
  color: #111;
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* Детали вопроса */
.question-details {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.answers-review {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.answer-review {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eee;
  position: relative;
}

.answer-review.correct-answer {
  border-color: #4caf50;
  background: #f1f8e9;
}

.answer-review.user-answer {
  border-color: #2196f3;
  background: #e3f2fd;
}

.answer-review.wrong-user-answer {
  border-color: #f44336;
  background: #ffebee;
}

.answer-marker {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #666;
}

.answer-text {
  flex: 1;
}

.answer-icon {
  margin-left: auto;
  font-size: 1.2rem;
  font-weight: bold;
}

.answer-icon.correct {
  color: #4caf50;
}

.answer-icon.wrong {
  color: #f44336;
}

/* Текстовый ответ */
.text-answer-review {
  margin-bottom: 24px;
}

.user-answer-block,
.correct-answer-block {
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f5f5;
  border: 1px solid #eee;
}

.user-answer-block h4,
.correct-answer-block h4,
.explanation h4,
.resources h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
}

.user-answer-block p,
.correct-answer-block p,
.explanation p {
  color: #333;
  line-height: 1.6;
  margin: 0;
}

/* Пояснение */
.explanation {
  margin-bottom: 24px;
  padding: 20px;
  background: #f5f5f5;
  border: 1px solid #eee;
}

/* Ресурсы */
.resources {
  margin-bottom: 16px;
}

.resources ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.resources li {
  margin-bottom: 8px;
}

.resources a {
  color: #111;
  text-decoration: none;
  border-bottom: 1px solid #eee;
  padding-bottom: 2px;
}

.resources a:hover {
  border-bottom-color: #111;
}

/* Мета-информация */
.question-meta {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-size: 0.85rem;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 1rem;
}

/* Кнопки */
.review-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
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

/* Адаптивность */
@media (max-width: 768px) {
  .review-title {
    font-size: 2rem;
  }

  .review-filters {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }

  .review-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .question-number {
    width: 100%;
    justify-content: space-between;
  }

  .toggle-details {
    width: 100%;
    text-align: left;
  }

  .question-meta {
    flex-direction: column;
    gap: 8px;
  }

  .review-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>