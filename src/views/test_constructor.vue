<template>
  <div class="test-constructor">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Верхняя панель -->
    <header class="constructor-header">
      <div class="container">
        <div class="header-left">
          <button @click="goBack" class="back-btn">←</button>
          <div class="test-info">
            <input
                type="text"
                v-model="test.title"
                placeholder="Название теста"
                class="title-input"
            />
            <span class="test-status" :class="test.status">{{ statusLabel }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="saveTest" class="btn btn-outline" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button @click="publishTest" class="btn btn-primary" :disabled="publishing">
            {{ publishing ? 'Публикация...' : 'Опубликовать' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="constructor-main">
      <div class="container">
        <div class="constructor-grid">
          <!-- Левая колонка: Список вопросов -->
          <aside class="questions-sidebar">
            <div class="sidebar-header">
              <h3>Вопросы ({{ test.questions.length }})</h3>
              <button @click="addQuestion" class="btn btn-primary btn-sm">+ Добавить</button>
            </div>

            <div class="questions-list">
              <div
                  v-for="(q, index) in test.questions"
                  :key="index"
                  class="question-item"
                  :class="{ active: currentQuestionIndex === index }"
                  @click="selectQuestion(index)"
              >
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-preview">
                  <span class="question-type">{{ questionTypeIcon(q.type) }}</span>
                  <span class="question-text">{{ q.text || 'Новый вопрос' }}</span>
                </div>
                <div class="question-actions">
                  <button @click.stop="duplicateQuestion(index)" class="icon-btn">📋</button>
                  <button @click.stop="deleteQuestion(index)" class="icon-btn delete">✕</button>
                </div>
              </div>
            </div>

            <div class="sidebar-footer">
              <div class="test-total">
                <span>Всего вопросов: {{ test.questions.length }}</span>
                <span>Макс. баллов: {{ maxScore }}</span>
              </div>
            </div>
          </aside>

          <!-- Правая колонка: Редактор вопроса -->
          <section class="question-editor" v-if="currentQuestion">
            <div class="editor-header">
              <h2>Вопрос {{ currentQuestionIndex + 1 }}</h2>
              <div class="question-type-selector">
                <select v-model="currentQuestion.type" class="type-select">
                  <option value="single">Один вариант</option>
                  <option value="multiple">Несколько вариантов</option>
                  <option value="text">Текстовый ответ</option>
                  <option value="match">Сопоставление</option>
                </select>
              </div>
            </div>

            <!-- Текст вопроса -->
            <div class="form-group">
              <label>Текст вопроса</label>
              <textarea
                  v-model="currentQuestion.text"
                  rows="3"
                  placeholder="Введите текст вопроса..."
                  class="form-input"
              ></textarea>
            </div>

            <!-- Варианты ответов (для single/multiple) -->
            <div v-if="currentQuestion.type === 'single' || currentQuestion.type === 'multiple'" class="options-editor">
              <label>Варианты ответов</label>
              <div v-for="(opt, idx) in currentQuestion.options" :key="idx" class="option-row">
                <input
                    type="text"
                    v-model="currentQuestion.options[idx]"
                    :placeholder="`Вариант ${idx + 1}`"
                    class="option-input"
                />
                <div class="option-controls">
                  <label class="correct-checkbox">
                    <input
                        type="checkbox"
                        :checked="isCorrectOption(idx)"
                        @change="toggleCorrectOption(idx)"
                    />
                    <span>Правильный</span>
                  </label>
                  <button @click="removeOption(idx)" class="icon-btn small">✕</button>
                </div>
              </div>
              <button @click="addOption" class="btn btn-outline btn-sm">
                + Добавить вариант
              </button>
            </div>

            <!-- Для текстового ответа -->
            <div v-if="currentQuestion.type === 'text'" class="text-answer-settings">
              <label class="checkbox">
                <input type="checkbox" v-model="currentQuestion.caseSensitive" />
                <span>Учитывать регистр</span>
              </label>
              <div class="form-group">
                <label>Ключевые слова (через запятую)</label>
                <input
                    type="text"
                    v-model="currentQuestion.keywords"
                    placeholder="например: функция, замыкание, область видимости"
                    class="form-input"
                />
              </div>
            </div>

            <!-- Для сопоставления -->
            <div v-if="currentQuestion.type === 'match'" class="match-editor">
              <div class="match-pairs">
                <div v-for="(pair, idx) in currentQuestion.pairs" :key="idx" class="match-row">
                  <input
                      type="text"
                      v-model="pair.left"
                      placeholder="Левый элемент"
                      class="match-input left"
                  />
                  <span class="match-arrow">→</span>
                  <input
                      type="text"
                      v-model="pair.right"
                      placeholder="Правый элемент"
                      class="match-input right"
                  />
                  <button @click="removePair(idx)" class="icon-btn small">✕</button>
                </div>
              </div>
              <button @click="addPair" class="btn btn-outline btn-sm">
                + Добавить пару
              </button>
            </div>

            <!-- Баллы -->
            <div class="form-group points">
              <label>Баллы за вопрос</label>
              <input
                  type="number"
                  v-model.number="currentQuestion.points"
                  min="1"
                  class="points-input"
              />
            </div>

            <!-- Пояснение/Подсказка -->
            <div class="form-group">
              <label>Пояснение (показывается после ответа)</label>
              <textarea
                  v-model="currentQuestion.explanation"
                  rows="2"
                  placeholder="Объясните правильный ответ..."
                  class="form-input"
              ></textarea>
            </div>

            <!-- Дополнительные настройки -->
            <details class="advanced-settings">
              <summary>Дополнительные настройки</summary>

              <div class="form-group">
                <label>Изображение (URL)</label>
                <input
                    type="url"
                    v-model="currentQuestion.image"
                    placeholder="https://..."
                    class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Код (для вопросов по программированию)</label>
                <textarea
                    v-model="currentQuestion.code"
                    rows="4"
                    placeholder="Вставьте код..."
                    class="form-input code-input"
                ></textarea>
              </div>

              <label class="checkbox">
                <input type="checkbox" v-model="currentQuestion.required" />
                <span>Обязательный вопрос</span>
              </label>
            </details>
          </section>

          <!-- Пустое состояние редактора -->
          <section v-else class="question-editor empty">
            <div class="empty-state">
              <p class="empty-icon">📝</p>
              <h3>Нет вопросов</h3>
              <p>Добавьте первый вопрос</p>
              <button @click="addQuestion" class="btn btn-primary">+ Добавить вопрос</button>
            </div>
          </section>
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
  name: 'TestConstructor',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      testId: null,
      saving: false,
      publishing: false,
      currentQuestionIndex: 0,

      test: {
        title: '',
        description: '',
        status: 'draft',
        time: 30,
        passingScore: 70,
        questions: []
      }
    }
  },
  computed: {
    statusLabel() {
      return this.test.status === 'draft' ? 'Черновик' : 'Опубликовано'
    },

    currentQuestion() {
      return this.test.questions[this.currentQuestionIndex]
    },

    maxScore() {
      return this.test.questions.reduce((sum, q) => sum + (q.points || 1), 0)
    }
  },
  created() {
    this.testId = this.$route.params.id
    this.isNewTest = this.testId === 'new'

    if (!this.isNewTest) {
      this.loadTest()
    } else {
      this.initNewTest()
    }
  },
  methods: {
    initNewTest() {
      this.test = {
        id: 'new',
        title: 'Новый тест',
        description: '',
        status: 'draft',
        time: 30,
        passingScore: 70,
        questions: []
      }
      console.log('Создание нового теста')
    },

    loadTest() {
      console.log('Загрузка теста для редактирования:', this.testId)
      // Здесь будет загрузка с API
    },

    goBack() {
      this.$router.push('/teacher/tests')
    },

    saveTest() {
      this.saving = true
      setTimeout(() => {
        console.log('Тест сохранен:', this.test)
        this.saving = false
        if (this.isNewTest) {
          // После сохранения нового теста, переходим в режим редактирования
          this.isNewTest = false
          this.testId = 'temp-id' // Здесь должен быть реальный ID из ответа сервера
        }
      }, 500)
    },

    publishTest() {
      this.publishing = true
      setTimeout(() => {
        console.log('Тест опубликован:', this.test)
        this.publishing = false
        this.test.status = 'published'
      }, 500)
    },

    addQuestion() {
      const newQuestion = {
        id: Date.now(),
        type: 'single',
        text: '',
        options: ['', ''],
        correctAnswers: [0],
        points: 1,
        explanation: '',
        required: true
      }

      this.test.questions.push(newQuestion)
      this.currentQuestionIndex = this.test.questions.length - 1
    },

    selectQuestion(index) {
      this.currentQuestionIndex = index
    },

    duplicateQuestion(index) {
      const question = JSON.parse(JSON.stringify(this.test.questions[index]))
      question.id = Date.now()
      this.test.questions.splice(index + 1, 0, question)
    },

    deleteQuestion(index) {
      if (this.test.questions.length > 1) {
        this.test.questions.splice(index, 1)
        if (this.currentQuestionIndex >= index) {
          this.currentQuestionIndex = Math.max(0, this.currentQuestionIndex - 1)
        }
      } else {
        this.test.questions = []
        this.currentQuestionIndex = -1
      }
    },

    questionTypeIcon(type) {
      const icons = {
        single: '○',
        multiple: '☐',
        text: 'T',
        match: '↔'
      }
      return icons[type] || '○'
    },

    addOption() {
      if (this.currentQuestion) {
        this.currentQuestion.options.push('')
      }
    },

    removeOption(index) {
      if (this.currentQuestion.options.length > 1) {
        this.currentQuestion.options.splice(index, 1)
        // Удаляем этот вариант из правильных ответов
        const correctIndex = this.currentQuestion.correctAnswers.indexOf(index)
        if (correctIndex > -1) {
          this.currentQuestion.correctAnswers.splice(correctIndex, 1)
        }
        // Сдвигаем индексы
        this.currentQuestion.correctAnswers = this.currentQuestion.correctAnswers.map(i =>
            i > index ? i - 1 : i
        )
      }
    },

    isCorrectOption(index) {
      if (this.currentQuestion.type === 'single') {
        return this.currentQuestion.correctAnswers[0] === index
      } else {
        return this.currentQuestion.correctAnswers.includes(index)
      }
    },

    toggleCorrectOption(index) {
      if (this.currentQuestion.type === 'single') {
        this.currentQuestion.correctAnswers = [index]
      } else {
        const pos = this.currentQuestion.correctAnswers.indexOf(index)
        if (pos === -1) {
          this.currentQuestion.correctAnswers.push(index)
        } else {
          this.currentQuestion.correctAnswers.splice(pos, 1)
        }
      }
    },

    addPair() {
      if (!this.currentQuestion.pairs) {
        this.currentQuestion.pairs = []
      }
      this.currentQuestion.pairs.push({ left: '', right: '' })
    },

    removePair(index) {
      this.currentQuestion.pairs.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.test-constructor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Верхняя панель */
.constructor-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #eee;
  z-index: 100;
  padding: 12px 0;
}

.constructor-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #111;
}

.test-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-input {
  font-size: 1.25rem;
  font-weight: 500;
  border: none;
  padding: 8px 0;
  width: 300px;
}

.title-input:focus {
  outline: none;
  border-bottom: 1px solid #111;
}

.test-status {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  border: 1px solid;
}

.test-status.draft {
  border-color: #ff9800;
  color: #f57c00;
}

.test-status.published {
  border-color: #4caf50;
  color: #2e7d32;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Основной контент */
.constructor-main {
  padding-top: 100px;
  flex: 1;
}

.constructor-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  min-height: calc(100vh - 200px);
}

/* Боковая панель с вопросами */
.questions-sidebar {
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  height: calc(100vh - 150px);
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

.questions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.question-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}

.question-item:hover {
  border-color: #999;
}

.question-item.active {
  border-color: #111;
  border-width: 2px;
}

.question-number {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.question-preview {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 6px;
}

.question-type {
  font-size: 1rem;
  opacity: 0.5;
}

.question-text {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
}

.question-actions {
  display: flex;
  gap: 2px;
}

.sidebar-footer {
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.test-total {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

/* Редактор вопроса */
.question-editor {
  background: white;
  border: 1px solid #eee;
  padding: 32px;
  min-height: calc(100vh - 150px);
}

.question-editor.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.editor-header h2 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

.type-select {
  padding: 8px 24px 8px 12px;
  border: 1px solid #ddd;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M7%2010L2%205h10z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.form-group {
  margin-bottom: 24px;
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
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #111;
}

/* Редактор вариантов */
.options-editor {
  margin-bottom: 24px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.option-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
}

.option-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.correct-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
}

.correct-checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
}

/* Сопоставление */
.match-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.match-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
}

.match-arrow {
  color: #999;
}

/* Баллы */
.points {
  display: flex;
  align-items: center;
  gap: 12px;
}

.points-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
}

/* Чекбоксы */
.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 0.95rem;
}

.checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
}

/* Дополнительные настройки */
.advanced-settings {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.advanced-settings summary {
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.advanced-settings summary:hover {
  color: #111;
}

.advanced-settings[open] {
  padding-bottom: 16px;
}

/* Код */
.code-input {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
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

.btn-primary:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.btn-outline {
  background: transparent;
  color: #111;
  border-color: #ddd;
}

.btn-outline:hover:not(:disabled) {
  border-color: #111;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  font-size: 0.9rem;
}

.icon-btn:hover {
  border-color: #111;
}

.icon-btn.delete:hover {
  border-color: #f44336;
  color: #f44336;
}

.icon-btn.small {
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 60px 0;
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

/* Адаптивность */
@media (max-width: 1024px) {
  .constructor-grid {
    grid-template-columns: 250px 1fr;
  }

  .title-input {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .constructor-grid {
    grid-template-columns: 1fr;
  }

  .questions-sidebar {
    position: static;
    height: auto;
    max-height: 300px;
  }

  .header-left {
    flex: 1;
  }

  .title-input {
    width: 150px;
  }

  .header-actions {
    flex-direction: column;
  }

  .option-row {
    flex-wrap: wrap;
  }

  .match-row {
    flex-wrap: wrap;
  }

  .match-input {
    width: 100%;
  }
}
</style>