<template>
  <div class="test-taking">
    <!-- Верхняя панель с таймером и прогрессом -->
    <header class="test-header">
      <div class="header-container">
        <div class="header-left">
          <button @click="confirmExit" class="back-link">
            <span class="back-icon">←</span>
            <span class="back-text">Выйти</span>
          </button>
          <div class="test-info">
            <h1 class="test-title">{{ test.title || 'Загрузка...' }}</h1>
            <span class="test-category">{{ test.category || 'Без категории' }}</span>
          </div>
        </div>

        <div class="header-right">
          <div class="timer" :class="{ 'timer-warning': timeRemaining < 300 }">
            <span class="timer-icon">⏱️</span>
            <span class="timer-value">{{ formatTime(timeRemaining) }}</span>
          </div>

          <div class="progress-indicator">
            <span class="progress-text">
              {{ currentQuestionIndex + 1 }} / {{ test.questionsCount }}
            </span>
            <div class="progress-bar">
              <div
                  v-if="test.questionsCount > 0"
                  class="progress-fill"
                  :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Основная область теста -->
    <main class="test-main">
      <div v-if="loading" class="loading-state">
        <div class="loader"></div>
        <p>Загрузка теста...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p class="error-icon">❌</p>
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
        <button @click="$router.push('/tests')" class="btn btn-primary">
          Вернуться к каталогу
        </button>
      </div>

      <div v-else-if="test.questionsList.length === 0" class="empty-state">
        <p class="empty-icon">📝</p>
        <h3>В тесте нет вопросов</h3>
        <button @click="$router.push('/tests')" class="btn btn-primary">
          Вернуться к каталогу
        </button>
      </div>

      <div v-else class="test-container">
        <!-- Боковая панель с навигацией по вопросам -->
        <aside class="questions-sidebar">
          <div class="sidebar-header">
            <h3>Вопросы</h3>
            <span class="answered-count">{{ answeredCount }}/{{ test.questionsCount }} отвечено</span>
          </div>

          <!-- Компактный список вопросов -->
          <div class="questions-compact-list">
            <div class="questions-header">
              <span class="questions-title">Вопросы</span>
              <span class="questions-count">{{ answeredCount }}/{{ test.questionsCount }}</span>
            </div>

            <div class="questions-scroll">
              <button
                  v-for="(q, index) in test.questionsList"
                  :key="q?.id || index"
                  class="question-chip"
                  :class="{
                    'current': currentQuestionIndex === index,
                    'answered': isQuestionAnswered(index),
                    'flagged': isQuestionFlagged(index)
                  }"
                  @click="goToQuestion(index)"
              >
                <span class="chip-number">{{ index + 1 }}</span>
                <span v-if="isQuestionFlagged(index)" class="chip-flag">⚑</span>
              </button>
            </div>
          </div>

          <div class="sidebar-footer">
            <div class="legend-mini">
              <div class="legend-item">
                <span class="legend-dot current"></span>
                <span>Текущий</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot answered"></span>
                <span>Отвечен</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot flagged"></span>
                <span>Отмечен</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Область текущего вопроса -->
        <section class="question-area">
          <!-- Прогресс по вопросу (для мобильных) -->
          <div class="mobile-progress">
            <span class="mobile-question-count">
              Вопрос {{ currentQuestionIndex + 1 }} из {{ test.questionsCount }}
            </span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>

          <!-- Карточка вопроса -->
          <div v-if="currentQuestion" class="question-card">
            <div class="question-header">
              <span class="question-type">{{ questionTypeLabel }}</span>
              <button
                  class="flag-question"
                  @click="toggleFlag(currentQuestionIndex)"
                  :class="{ 'flagged': isQuestionFlagged(currentQuestionIndex) }"
              >
                <span class="flag-icon">⚑</span>
                <span>{{ isQuestionFlagged(currentQuestionIndex) ? 'Отмечено' : 'Отметить' }}</span>
              </button>
            </div>

            <h2 class="question-text">{{ currentQuestion.text }}</h2>

            <!-- Варианты ответов в зависимости от типа вопроса -->
            <div class="answers-container" :class="questionTypeClass">
              <!-- Одиночный выбор (radio) -->
              <div v-if="currentQuestion.type === 'single'" class="answers-list">
                <label
                    v-for="(option, idx) in currentQuestion.options"
                    :key="option?.id || idx"
                    class="answer-option"
                    :class="{ 'selected': isOptionSelected(currentQuestionIndex, idx) }"
                >
                  <input
                      type="radio"
                      :name="'question-' + currentQuestion.id"
                      :value="option?.id"
                      :checked="isOptionSelected(currentQuestionIndex, idx)"
                      @change="selectOption(currentQuestionIndex, idx)"
                      class="answer-input"
                  />
                  <span class="answer-marker"></span>
                  <span class="answer-text">{{ option?.text || 'Вариант ответа' }}</span>
                </label>
              </div>

              <!-- Множественный выбор (checkbox) -->
              <div v-else-if="currentQuestion.type === 'multiple'" class="answers-list">
                <label
                    v-for="(option, idx) in currentQuestion.options"
                    :key="option?.id || idx"
                    class="answer-option"
                    :class="{ 'selected': isOptionSelected(currentQuestionIndex, idx) }"
                >
                  <input
                      type="checkbox"
                      :name="'question-' + currentQuestion.id + '-' + idx"
                      :value="option?.id"
                      :checked="isOptionSelected(currentQuestionIndex, idx)"
                      @change="toggleOption(currentQuestionIndex, idx)"
                      class="answer-input"
                  />
                  <span class="answer-marker"></span>
                  <span class="answer-text">{{ option?.text || 'Вариант ответа' }}</span>
                </label>
              </div>

              <!-- Текстовый ответ -->
              <div v-else-if="currentQuestion.type === 'text'" class="text-answer">
                <textarea
                    v-model="textAnswers[currentQuestion.id]"
                    @input="saveTextAnswer(currentQuestion.id, $event.target.value)"
                    placeholder="Введите ваш ответ..."
                    rows="6"
                    class="text-input"
                ></textarea>
              </div>
            </div>

            <!-- Подсказка (если есть) -->
            <div v-if="currentQuestion.hint" class="hint-container">
              <button @click="showHint = !showHint" class="hint-toggle">
                <span>💡</span>
                {{ showHint ? 'Скрыть подсказку' : 'Показать подсказку' }}
              </button>
              <p v-if="showHint" class="hint-text">{{ currentQuestion.hint }}</p>
            </div>
          </div>

          <!-- Нижняя навигация между вопросами -->
          <div class="question-navigation">
            <button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
                class="nav-btn prev"
            >
              ← Предыдущий
            </button>

            <div class="nav-center">
              <button @click="toggleFlag(currentQuestionIndex)" class="flag-btn-mobile">
                <span class="flag-icon">⚑</span>
                {{ isQuestionFlagged(currentQuestionIndex) ? 'Отмечено' : 'Отметить' }}
              </button>
            </div>

            <button
                @click="nextQuestion"
                :disabled="currentQuestionIndex === test.questionsCount - 1"
                class="nav-btn next"
            >
              Следующий →
            </button>
          </div>

          <!-- Кнопка завершения -->
          <div class="finish-section">
            <button @click="confirmFinish" class="btn btn-outline finish-btn">
              Завершить тест
            </button>
            <p class="finish-note">
              Вы можете вернуться и изменить ответы до завершения
            </p>
          </div>
        </section>
      </div>
    </main>

    <!-- Модальное окно подтверждения завершения -->
    <div v-if="showFinishConfirm" class="modal-overlay" @click.self="showFinishConfirm = false">
      <div class="modal finish-modal">
        <h2 class="modal-title">Завершить тест?</h2>

        <div class="modal-stats">
          <div class="modal-stat">
            <span class="modal-stat-label">Отвечено</span>
            <span class="modal-stat-value">{{ answeredCount }}/{{ test.questionsCount }}</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-label">Не отвечено</span>
            <span class="modal-stat-value">{{ test.questionsCount - answeredCount }}</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-label">Отмечено</span>
            <span class="modal-stat-value">{{ flaggedCount }}</span>
          </div>
        </div>

        <div v-if="test.questionsCount - answeredCount > 0" class="modal-warning">
          <span class="warning-icon">⚠️</span>
          <span>У вас остались неотвеченные вопросы</span>
        </div>

        <div class="modal-actions">
          <button @click="finishTest" class="btn btn-primary">Да, завершить</button>
          <button @click="showFinishConfirm = false" class="btn btn-outline">Продолжить</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно предупреждения о выходе -->
    <div v-if="showExitConfirm" class="modal-overlay" @click.self="showExitConfirm = false">
      <div class="modal exit-modal">
        <h2 class="modal-title">Выйти из теста?</h2>
        <p class="modal-text">
          Весь прогресс будет потерян. Вы уверены, что хотите выйти?
        </p>
        <div class="modal-actions">
          <button @click="exitTest" class="btn btn-primary">Выйти</button>
          <button @click="showExitConfirm = false" class="btn btn-outline">Остаться</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'TestTaking',
  data() {
    return {
      testId: null,
      attemptId: null,
      currentQuestionIndex: 0,
      answers: {},
      textAnswers: {},
      flaggedQuestions: new Set(),
      timeRemaining: 0,
      timerInterval: null,
      showHint: false,
      showFinishConfirm: false,
      showExitConfirm: false,
      loading: true,
      saving: false,
      error: null,

      test: {
        id: null,
        title: '',
        category: '',
        description: '',
        time_limit: 0,
        passing_score: 70,
        questionsCount: 0,
        questionsList: []
      }
    }
  },
  computed: {
    currentQuestion() {
      return this.test.questionsList?.[this.currentQuestionIndex]
    },
    questionTypeLabel() {
      if (!this.currentQuestion) return 'Вопрос'
      const types = {
        'single': 'Один вариант',
        'multiple': 'Несколько вариантов',
        'text': 'Развернутый ответ'
      }
      return types[this.currentQuestion.type] || 'Вопрос'
    },
    questionTypeClass() {
      return `type-${this.currentQuestion?.type || 'unknown'}`
    },
    progressPercentage() {
      if (!this.test.questionsCount) return 0
      return ((this.currentQuestionIndex + 1) / this.test.questionsCount) * 100
    },
    answeredCount() {
      if (!this.test.questionsList?.length) return 0
      let count = 0
      for (const question of this.test.questionsList) {
        if (question?.id && this.isQuestionAnsweredById(question.id)) count++
      }
      return count
    },
    flaggedCount() {
      return this.flaggedQuestions.size
    }
  },
  async created() {
    this.testId = this.$route.params.id
    await this.initTest()
  },
  beforeDestroy() {
    this.stopTimer()
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },
  methods: {
    async initTest() {
      try {
        await this.loadTest()
        if (this.test.questionsList?.length > 0) {
          await this.createOrGetAttempt()
          this.startTimer()
          window.addEventListener('beforeunload', this.handleBeforeUnload)
        }
      } catch (error) {
        console.error('Error initializing test:', error)
        this.error = 'Не удалось загрузить тест'
      } finally {
        this.loading = false
      }
    },

    async loadTest() {
      this.loading = true
      try {
        // Загружаем информацию о тесте
        const { data: testData, error: testError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', this.testId)
            .single()

        console.log('testData', testData)

        if (testError) throw testError
        if (!testData) throw new Error('Тест не найден')

        // Загружаем вопросы теста
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select(`
              *,
              options (*)
            `)
            .eq('test_id', this.testId)
            .order('order', { ascending: true })

        console.log('questionsData', questionsData)


        if (questionsError) throw questionsError

        // Форматируем данные
        this.test = {
          id: testData.id,
          title: testData.title || 'Без названия',
          category: testData.category || 'Без категории',
          description: testData.description || '',
          time_limit: testData.time_limit || 30,
          passing_score: testData.passing_score || 70,
          questionsCount: questionsData?.length || 0,
          questionsList: (questionsData || []).map(q => ({
            id: q.id,
            type: q.type || 'single',
            text: q.text || '',
            hint: q.hint || '',
            options: (q.options || []).sort((a, b) => a.order - b.order).map(o => ({
              id: o.id,
              text: o.text || '',
              is_correct: o.is_correct || false
            }))
          }))
        }

        this.timeRemaining = (this.test.time_limit || 30) * 60
        await this.loadSavedAnswers()

      } catch (error) {
        console.error('Error loading test:', error)
        this.error = error.message
        this.$router.push('/tests')
      } finally {
        this.loading = false
      }
    },

    async createOrGetAttempt() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          this.$router.push('/login')
          return
        }

        // Проверяем, есть ли уже активная попытка
        const { data: existingAttempts, error: checkError } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('test_id', this.testId)
            .eq('status', 'in_progress')
            .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') throw checkError

        if (existingAttempts) {
          // Используем существующую попытку
          this.attemptId = existingAttempts.id
          const elapsedSeconds = Math.floor((Date.now() - new Date(existingAttempts.started_at).getTime()) / 1000)
          this.timeRemaining = Math.max(0, (this.test.time_limit * 60) - elapsedSeconds)
        } else {
          // Создаем новую попытку
          const { data: newAttempt, error: createError } = await supabase
              .from('attempts')
              .insert([{
                user_id: user.id,
                test_id: this.testId,
                status: 'in_progress',
                started_at: new Date().toISOString()
              }])
              .select()
              .single()

          if (createError) throw createError
          this.attemptId = newAttempt.id
        }

        // Загружаем сохраненные ответы после получения attemptId
        await this.loadAnswersFromDB()

      } catch (error) {
        console.error('Error with attempt:', error)
        // Если RLS блокирует, продолжаем работу с localStorage
        console.log('Continuing with localStorage only')
      }
    },

    async loadAnswersFromDB() {
      if (!this.attemptId) return

      try {
        const { data: answers, error } = await supabase
            .from('answers')
            .select('*')
            .eq('attempt_id', this.attemptId)

        if (error) {
          console.warn('Could not load answers from DB:', error.message)
          return
        }

        answers?.forEach(answer => {
          if (answer.answer_data?.selected) {
            if (Array.isArray(answer.answer_data.selected)) {
              this.$set(this.answers, answer.question_id, answer.answer_data.selected)
            } else {
              this.$set(this.answers, answer.question_id, answer.answer_data.selected)
            }
          } else if (answer.answer_data?.text) {
            this.$set(this.textAnswers, answer.question_id, answer.answer_data.text)
          }
        })
      } catch (error) {
        console.warn('Error loading answers from DB:', error)
      }
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
          this.saveToLocalStorage()
        } else {
          this.finishTest()
        }
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.test.questionsList.length) {
        this.currentQuestionIndex = index
        this.showHint = false
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
        this.showHint = false
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.test.questionsList.length - 1) {
        this.currentQuestionIndex++
        this.showHint = false
      }
    },

    isQuestionAnswered(index) {
      const question = this.test.questionsList[index]
      return question?.id ? this.isQuestionAnsweredById(question.id) : false
    },

    isQuestionAnsweredById(questionId) {
      if (!questionId) return false
      const question = this.test.questionsList.find(q => q.id === questionId)
      if (!question) return false

      if (question.type === 'text') {
        return this.textAnswers[questionId]?.trim()?.length > 0
      } else if (question.type === 'multiple') {
        const answer = this.answers[questionId]
        return answer && Array.isArray(answer) && answer.length > 0
      } else {
        return this.answers[questionId] !== undefined
      }
    },

    isOptionSelected(questionIndex, optionIndex) {
      const question = this.test.questionsList[questionIndex]
      if (!question) return false

      const option = question.options?.[optionIndex]
      if (!option) return false

      if (question.type === 'multiple') {
        const answer = this.answers[question.id]
        return answer && Array.isArray(answer) && answer.includes(option.id)
      } else {
        return this.answers[question.id] === option.id
      }
    },

    selectOption(questionIndex, optionIndex) {
      const question = this.test.questionsList[questionIndex]
      if (!question) return

      const option = question.options?.[optionIndex]
      if (!option) return

      this.$set(this.answers, question.id, option.id)
      this.saveAnswer(question.id, { selected: option.id })
    },

    toggleOption(questionIndex, optionIndex) {
      const question = this.test.questionsList[questionIndex]
      if (!question) return

      const option = question.options?.[optionIndex]
      if (!option) return

      if (!this.answers[question.id]) {
        this.$set(this.answers, question.id, [])
      }

      const currentAnswers = [...(this.answers[question.id] || [])]
      const index = currentAnswers.indexOf(option.id)

      if (index === -1) {
        currentAnswers.push(option.id)
      } else {
        currentAnswers.splice(index, 1)
      }

      this.$set(this.answers, question.id, currentAnswers)
      this.saveAnswer(question.id, { selected: currentAnswers })
    },

    saveTextAnswer(questionId, value) {
      if (!questionId) return
      this.$set(this.textAnswers, questionId, value)
      this.saveAnswer(questionId, { text: value })
    },

    async saveAnswer(questionId, answerData) {
      if (!questionId) return

      this.saveToLocalStorage()

      if (!this.attemptId) return

      try {
        await supabase
            .from('answers')
            .upsert({
              attempt_id: this.attemptId,
              question_id: questionId,
              answer_data: answerData,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'attempt_id,question_id',
              ignoreDuplicates: false
            })
      } catch (error) {
        console.warn('Could not save answer to DB:', error.message)
      }
    },

    toggleFlag(questionIndex) {
      const question = this.test.questionsList[questionIndex]
      if (!question) return

      if (this.flaggedQuestions.has(question.id)) {
        this.flaggedQuestions.delete(question.id)
      } else {
        this.flaggedQuestions.add(question.id)
      }
      this.flaggedQuestions = new Set(this.flaggedQuestions)
      this.saveToLocalStorage()
    },

    isQuestionFlagged(questionIndex) {
      const question = this.test.questionsList[questionIndex]
      return question?.id ? this.flaggedQuestions.has(question.id) : false
    },

    saveToLocalStorage() {
      const state = {
        answers: this.answers,
        textAnswers: this.textAnswers,
        flaggedQuestions: Array.from(this.flaggedQuestions),
        currentQuestionIndex: this.currentQuestionIndex,
        timeRemaining: this.timeRemaining
      }
      localStorage.setItem(`test_${this.testId}`, JSON.stringify(state))
    },

    async loadSavedAnswers() {
      const saved = localStorage.getItem(`test_${this.testId}`)
      if (saved) {
        try {
          const state = JSON.parse(saved)
          this.answers = state.answers || {}
          this.textAnswers = state.textAnswers || {}
          this.flaggedQuestions = new Set(state.flaggedQuestions || [])
          this.currentQuestionIndex = state.currentQuestionIndex || 0
          this.timeRemaining = state.timeRemaining || this.timeRemaining
        } catch (e) {
          console.error('Failed to load saved answers:', e)
        }
      }
    },

    confirmFinish() {
      this.showFinishConfirm = true
    },

    async finishTest() {
      this.stopTimer()

      try {
        const results = this.calculateResults()

        if (this.attemptId) {
          try {
            await supabase
                .from('attempts')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  score: results.score,
                  correct_answers: results.correct,
                  total_questions: this.test.questionsCount,
                  time_spent: (this.test.time_limit * 60) - this.timeRemaining
                })
                .eq('id', this.attemptId)
          } catch (error) {
            console.warn('Could not save results to DB:', error.message)
          }
        }

        localStorage.setItem(`test_result_${this.testId}`, JSON.stringify(results))
        localStorage.removeItem(`test_${this.testId}`)

        this.$router.push(`/test/${this.testId}/results`)
      } catch (error) {
        console.error('Error finishing test:', error)
      }
    },

    calculateResults() {
      let correctCount = 0

      this.test.questionsList.forEach(question => {
        if (!question) return

        if (question.type === 'single') {
          const selectedOptionId = this.answers[question.id]
          const correctOption = question.options.find(o => o.is_correct)
          if (selectedOptionId && correctOption && selectedOptionId === correctOption.id) {
            correctCount++
          }
        } else if (question.type === 'multiple') {
          const selectedIds = this.answers[question.id] || []
          const correctIds = question.options.filter(o => o.is_correct).map(o => o.id)

          const isCorrect = correctIds.length === selectedIds.length &&
              correctIds.every(id => selectedIds.includes(id))
          if (isCorrect) correctCount++
        } else if (question.type === 'text') {
          if (this.textAnswers[question.id]?.trim()?.length > 0) {
            correctCount++
          }
        }
      })

      const score = this.test.questionsCount > 0
          ? Math.round((correctCount / this.test.questionsCount) * 100)
          : 0
      const timeSpent = (this.test.time_limit * 60) - this.timeRemaining

      return {
        totalQuestions: this.test.questionsCount,
        answered: this.answeredCount,
        correct: correctCount,
        incorrect: this.answeredCount - correctCount,
        skipped: this.test.questionsCount - this.answeredCount,
        score: score,
        scorePercentage: score,
        timeSpent: timeSpent,
        passed: score >= (this.test.passing_score || 70)
      }
    },

    confirmExit() {
      this.showExitConfirm = true
    },

    exitTest() {
      this.stopTimer()
      localStorage.removeItem(`test_${this.testId}`)
      this.$router.push('/tests')
    },

    handleBeforeUnload(e) {
      if (this.answeredCount > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
  }
}
</script>

<style scoped>
/* Стили для loading-state, error-state, empty-state */
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}


.test-taking {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

/* Хедер теста */
.test-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #eee;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #666;
  transition: color 0.2s;
  padding: 6px 12px;
  border: 1px solid #eee;
}
/* Вариант 1: Точки (минималистичный) */
.questions-mini-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.question-dot {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.question-dot:hover {
  border-color: #111;
  transform: scale(1.05);
}

.question-dot.current {
  border-color: #111;
  border-width: 2px;
}

.question-dot.answered {
  background: #f5f5f5;
}

.question-dot.answered::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #111;
  border-radius: 0;
}

.dot-flag {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 12px;
  color: #f44336;
}

/* Вариант 2: Чипы (более информативный) */
.questions-compact-list {
  border: 1px solid #eee;
  background: white;
  padding: 16px;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.questions-title {
  font-size: 0.95rem;
  font-weight: 500;
}

.questions-count {
  font-size: 0.85rem;
  color: #666;
}

.questions-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
}

.question-chip {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.question-chip:hover {
  border-color: #111;
}
/* Стили для компактной боковой панели */
.sidebar-compact {
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 90px;
  width: 260px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.badge {
  background: #f5f5f5;
  padding: 2px 8px;
  font-size: 0.85rem;
  color: #666;
}

.legend-mini {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border: 1px solid;
}

.legend-dot.current {
  border-color: #111;
  border-width: 2px;
}

.legend-dot.answered {
  background: #f5f5f5;
  border-color: #eee;
}

.legend-dot.flagged {
  border-color: #f44336;
}
.question-chip.current {
  border-color: #111;
  border-width: 2px;
  font-weight: 500;
}

.question-chip.answered {
  background: #f5f5f5;
}

.question-chip.flagged {
  border-color: #f44336;
}

.chip-flag {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 12px;
  color: #f44336;
}

/* Для мобильных */
@media (max-width: 768px) {
  .questions-scroll {
    max-height: 120px;
  }

  .question-chip {
    min-width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
}
.back-link:hover {
  color: #111;
  border-color: #111;
}

.back-icon {
  font-size: 1.2rem;
}

.test-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.test-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.test-category {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 6px 12px;
  border: 1px solid #eee;
}

.timer-warning {
  color: #f44336;
  border-color: #f44336;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 0.95rem;
  color: #666;
  min-width: 60px;
}

.progress-bar {
  width: 100px;
  height: 4px;
  background: #eee;
}

.progress-fill {
  height: 100%;
  background: #111;
  transition: width 0.3s ease;
}

/* Основной контент */
.test-main {
  padding-top: 80px;
  flex: 1;
}

.test-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
}

/* Боковая панель с вопросами */
.questions-sidebar {
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  height: calc(100vh - 120px);
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.answered-count {
  font-size: 0.85rem;
  color: #666;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 20px;
  overflow-y: auto;
  flex: 1;
}

.question-nav-btn {
  aspect-ratio: 1;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-nav-btn:hover {
  border-color: #111;
}

.question-nav-btn.current {
  border-color: #111;
  border-width: 2px;
  font-weight: 500;
}

.question-nav-btn.answered {
  background: #f5f5f5;
}

.question-nav-btn.flagged {
  border-color: #f44336;
}

.flag-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.8rem;
  color: #f44336;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border: 1px solid;
}

.legend-color.current {
  border-color: #111;
  border-width: 2px;
}

.legend-color.answered {
  background: #f5f5f5;
  border-color: #eee;
}

.legend-color.flagged {
  border-color: #f44336;
}

/* Область вопроса */
.question-area {
  min-height: calc(100vh - 120px);
}

.mobile-progress {
  display: none;
  margin-bottom: 20px;
}

.mobile-question-count {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}

.question-card {
  background: white;
  border: 1px solid #eee;
  padding: 40px;
  margin-bottom: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.question-type {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.flag-question {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  padding: 4px 8px;
  transition: all 0.2s;
}

.flag-question:hover {
  color: #f44336;
}

.flag-question.flagged {
  color: #f44336;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 450;
  line-height: 1.4;
  margin-bottom: 32px;
}

/* Варианты ответов */
.answers-container {
  margin-bottom: 32px;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.answer-option:hover {
  border-color: #111;
}

.answer-option.selected {
  border-color: #111;
  background: #fafafa;
}

.answer-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.answer-marker {
  width: 18px;
  height: 18px;
  border: 1px solid #ddd;
  display: inline-block;
  position: relative;
  flex-shrink: 0;
}

input[type="radio"] + .answer-marker {
  border-radius: 0;
}

input[type="checkbox"] + .answer-marker {
  border-radius: 0;
}

input[type="radio"]:checked + .answer-marker::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: #111;
}

input[type="checkbox"]:checked + .answer-marker::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #111;
  font-size: 12px;
}

.answer-text {
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

/* Текстовый ответ */
.text-input {
  width: 100%;
  padding: 16px;
  border: 1px solid #eee;
  font-size: 1rem;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
}

.text-input:focus {
  outline: none;
  border-color: #111;
}

/* Сопоставление */
.match-pair {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
}

.match-left {
  min-width: 120px;
  font-weight: 500;
}

.match-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.match-select:focus {
  outline: none;
  border-color: #111;
}

.match-note {
  margin-bottom: 16px;
  color: #666;
}

/* Подсказка */
.hint-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.hint-toggle {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.hint-toggle:hover {
  color: #111;
}

.hint-text {
  margin-top: 12px;
  padding: 16px;
  background: #fff9c4;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Навигация между вопросами */
.question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.nav-btn:hover:not(:disabled) {
  border-color: #111;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-center {
  display: flex;
  gap: 12px;
}

.flag-btn-mobile {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  font-size: 0.95rem;
}

.flag-btn-mobile:hover {
  border-color: #f44336;
}

/* Кнопка завершения */
.finish-section {
  text-align: center;
}

.finish-btn {
  min-width: 200px;
  margin-bottom: 12px;
}

.finish-note {
  color: #999;
  font-size: 0.85rem;
}

/* Модальные окна */
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
  max-width: 400px;
  padding: 40px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 450;
  margin-bottom: 24px;
  text-align: center;
}

.modal-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #eee;
}

.modal-stat {
  text-align: center;
}

.modal-stat-label {
  display: block;
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.modal-stat-value {
  font-size: 1.5rem;
  font-weight: 450;
  line-height: 1.2;
}

.modal-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff3e0;
  border: 1px solid #ffb74d;
  margin-bottom: 24px;
}

.warning-icon {
  font-size: 1.2rem;
}

.modal-text {
  color: #666;
  margin-bottom: 24px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

/* Кнопки */
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
  flex: 1;
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
@media (max-width: 1024px) {
  .test-container {
    grid-template-columns: 1fr;
  }

  .questions-sidebar {
    display: none;
  }

  .mobile-progress {
    display: block;
  }

  .flag-btn-mobile {
    display: flex;
  }

  .header-right {
    gap: 16px;
  }

  .progress-bar {
    width: 60px;
  }

  .test-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .question-card {
    padding: 24px;
  }

  .question-text {
    font-size: 1.25rem;
  }

  .question-navigation {
    flex-wrap: wrap;
    gap: 12px;
  }

  .nav-btn {
    flex: 1;
  }

  .nav-center {
    order: -1;
    width: 100%;
  }

  .flag-btn-mobile {
    width: 100%;
    justify-content: center;
  }

  .modal-actions {
    flex-direction: column;
  }

  .match-pair {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .match-left {
    min-width: auto;
  }

  .match-select {
    width: 100%;
  }
}
</style>