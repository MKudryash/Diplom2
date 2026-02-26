<template>
  <div class="test-review">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="review-main">
      <div class="container">
        <!-- Хлебные крошки -->
        <div class="breadcrumbs">
          <a href="/tests" class="breadcrumb-link">Каталог тестов</a>
          <span class="breadcrumb-separator">/</span>
          <a :href="`/test/${testId}`" class="breadcrumb-link">{{ test.title }}</a>
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
            Все вопросы ({{ test.questions }})
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
                <span class="number">Вопрос {{ question.number }}</span>
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
              <!-- Варианты ответов -->
              <div class="answers-review">
                <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="answer-review"
                    :class="{
                    'correct-answer': isCorrectAnswer(question, optIndex),
                    'user-answer': isUserAnswer(question, optIndex),
                    'wrong-user-answer': isWrongUserAnswer(question, optIndex)
                  }"
                >
                  <span class="answer-marker">
                    {{ String.fromCharCode(65 + optIndex) }}
                  </span>
                  <span class="answer-text">{{ option }}</span>
                  <span v-if="isCorrectAnswer(question, optIndex)" class="answer-icon correct">✓</span>
                  <span v-if="isWrongUserAnswer(question, optIndex)" class="answer-icon wrong">✗</span>
                </div>
              </div>

              <!-- Пояснение -->
              <div class="explanation">
                <h4>Пояснение</h4>
                <p>{{ question.explanation }}</p>
              </div>

              <!-- Дополнительные материалы -->
              <div v-if="question.resources" class="resources">
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
                {{ question.timeSpent }} сек
              </span>
              <span class="meta-item">
                <span class="meta-icon">📚</span>
                {{ question.category }}
              </span>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="review-actions">
          <button @click="backToResults" class="btn btn-outline">
            ← Назад к результатам
          </button>
          <button @click="practiceMistakes" class="btn btn-primary">
            Тренировка ошибок
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
  name: 'TestReview',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      testId: null,
      filter: 'all',
      expandedQuestions: {},
      test: {
        id: 1,
        title: 'Основы JavaScript',
        questions: 25
      },
      questions: [
        {
          id: 1,
          number: 1,
          text: 'Какое ключевое слово используется для объявления переменной в JavaScript?',
          type: 'single',
          options: ['var', 'let', 'const', 'Все вышеперечисленные'],
          correctAnswers: [3], // индексы правильных ответов
          userAnswers: [0], // что выбрал пользователь
          status: 'incorrect', // correct, incorrect, skipped
          timeSpent: 45,
          category: 'Основы',
          explanation: 'В JavaScript есть три способа объявления переменных: var (устаревший), let и const (современные, появились в ES6). Все они работают, но имеют разные области видимости и правила использования.',
          resources: [
            { title: 'MDN: Переменные в JavaScript', link: '#' },
            { title: 'Современный учебник: Переменные', link: '#' }
          ]
        },
        {
          id: 2,
          number: 2,
          text: 'Что выведет console.log(typeof [])?',
          type: 'single',
          options: ['array', 'object', 'undefined', 'null'],
          correctAnswers: [1],
          userAnswers: [1],
          status: 'correct',
          timeSpent: 30,
          category: 'Типы данных',
          explanation: 'В JavaScript массивы являются объектами. Оператор typeof возвращает "object" для массивов. Для проверки на массив лучше использовать Array.isArray().'
        },
        {
          id: 3,
          number: 3,
          text: 'Какие из следующих значений являются falsy в JavaScript?',
          type: 'multiple',
          options: ['0', '"" (пустая строка)', 'null', 'undefined', 'NaN', 'false', '[] (пустой массив)'],
          correctAnswers: [0, 1, 2, 3, 4, 5],
          userAnswers: [0, 1, 2, 6],
          status: 'incorrect',
          timeSpent: 60,
          category: 'Типы данных',
          explanation: 'Falsy значения в JavaScript: false, 0, -0, 0n, "" (пустая строка), null, undefined, NaN. Пустой массив [] не является falsy - это truthy значение.'
        },
        {
          id: 4,
          number: 4,
          text: 'Что такое замыкание (closure) в JavaScript?',
          type: 'text',
          options: [],
          correctAnswers: [],
          userAnswers: '',
          status: 'skipped',
          timeSpent: 0,
          category: 'Продвинутые концепции',
          explanation: 'Замыкание - это комбинация функции и лексического окружения, в котором эта функция была объявлена. Замыкание позволяет функции иметь доступ к переменным из внешней функции даже после того, как внешняя функция завершила выполнение.'
        },
        {
          id: 5,
          number: 5,
          text: 'Что выведет console.log(1 + "2" + 3)?',
          type: 'single',
          options: ['6', '123', '15', 'NaN'],
          correctAnswers: [1],
          userAnswers: [0],
          status: 'incorrect',
          timeSpent: 35,
          category: 'Приведение типов',
          explanation: 'В JavaScript оператор + при работе со строками выполняет конкатенацию. Здесь 1 + "2" дает "12", затем "12" + 3 дает "123".'
        }
      ]
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
  created() {
    this.testId = this.$route.params.id
    this.loadReviewData()

    // Инициализируем expandedQuestions
    this.filteredQuestions.forEach((_, index) => {
      this.$set(this.expandedQuestions, index, false)
    })
  },
  methods: {
    loadReviewData() {
      // Загружаем данные для разбора
      const saved = localStorage.getItem(`test_review_${this.testId}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          this.questions = data.questions || this.questions
        } catch (e) {
          console.error('Failed to load review data:', e)
        }
      }
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

    isCorrectAnswer(question, optionIndex) {
      if (question.type === 'text') return false
      return question.correctAnswers.includes(optionIndex)
    },

    isUserAnswer(question, optionIndex) {
      if (question.status === 'skipped') return false

      if (question.type === 'multiple') {
        return question.userAnswers && question.userAnswers.includes(optionIndex)
      } else if (question.type === 'single') {
        return question.userAnswers === optionIndex
      }
      return false
    },

    isWrongUserAnswer(question, optionIndex) {
      return this.isUserAnswer(question, optionIndex) &&
          !this.isCorrectAnswer(question, optionIndex)
    },

    backToResults() {
      this.$router.push(`/test/${this.testId}/results`)
    },

    practiceMistakes() {
      // Создаем тест только из ошибочных вопросов
      const mistakeQuestions = this.questions.filter(q => q.status === 'incorrect')
      localStorage.setItem(`practice_test_${this.testId}`, JSON.stringify(mistakeQuestions))
      this.$router.push(`/test/${this.testId}/practice`)
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

/* Пояснение */
.explanation {
  margin-bottom: 24px;
  padding: 20px;
  background: #f5f5f5;
  border: 1px solid #eee;
}

.explanation h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.explanation p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Ресурсы */
.resources {
  margin-bottom: 16px;
}

.resources h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
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