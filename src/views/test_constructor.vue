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
                :disabled="saving || publishing"
            />
            <span class="test-status" :class="test.status">{{ statusLabel }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="saveTest" class="btn btn-outline" :disabled="saving || !hasChanges">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button @click="publishTest" class="btn btn-primary" :disabled="publishing || !canPublish">
            {{ publishing ? 'Публикация...' : 'Опубликовать' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="constructor-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка теста...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">❌</p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="loadTest" class="btn btn-primary">Повторить</button>
        </div>

        <div v-else class="constructor-grid">
          <!-- Левая колонка: Список вопросов -->
          <aside class="questions-sidebar">
            <div class="sidebar-header">
              <h3>Вопросы ({{ test.questions.length }})</h3>
              <button @click="addQuestion" class="btn btn-primary btn-sm" :disabled="saving">
                + Добавить
              </button>
            </div>

            <div class="questions-list">
              <div
                  v-for="(q, index) in test.questions"
                  :key="q.id || index"
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
                  <button @click.stop="duplicateQuestion(index)" class="icon-btn" title="Дублировать">📋</button>
                  <button @click.stop="deleteQuestion(index)" class="icon-btn delete" title="Удалить">✕</button>
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
                <select v-model="currentQuestion.type" class="type-select" @change="onQuestionTypeChange">
                  <option value="single">Один вариант</option>
                  <option value="multiple">Несколько вариантов</option>
                  <option value="text">Текстовый ответ</option>
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
                  :disabled="saving"
              ></textarea>
            </div>

            <!-- Варианты ответов (для single/multiple) -->
            <div v-if="currentQuestion.type === 'single' || currentQuestion.type === 'multiple'" class="options-editor">
              <label>Варианты ответов</label>
              <div v-for="(opt, idx) in currentQuestion.options" :key="idx" class="option-row">
                <input
                    type="text"
                    v-model="opt.text"
                    :placeholder="`Вариант ${idx + 1}`"
                    class="option-input"
                    :disabled="saving"
                />
                <div class="option-controls">
                  <label class="correct-checkbox">
                    <input
                        type="checkbox"
                        :checked="opt.is_correct"
                        @change="toggleCorrectOption(idx)"
                        :disabled="saving"
                    />
                    <span>Правильный</span>
                  </label>
                  <button @click="removeOption(idx)" class="icon-btn small" :disabled="saving">✕</button>
                </div>
              </div>
              <button @click="addOption" class="btn btn-outline btn-sm" :disabled="saving">
                + Добавить вариант
              </button>
            </div>

            <!-- Для текстового ответа -->
            <div v-if="currentQuestion.type === 'text'" class="text-answer-settings">
              <div class="form-group">
                <label>Ключевые слова (через запятую)</label>
                <input
                    type="text"
                    v-model="currentQuestion.keywords"
                    placeholder="например: функция, замыкание, область видимости"
                    class="form-input"
                    :disabled="saving"
                />
              </div>
            </div>

            <!-- Баллы -->
            <div class="form-group points">
              <label>Баллы за вопрос</label>
              <input
                  type="number"
                  v-model.number="currentQuestion.points"
                  min="1"
                  class="points-input"
                  :disabled="saving"
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
                  :disabled="saving"
              ></textarea>
            </div>

            <!-- Дополнительные настройки -->
            <details class="advanced-settings">
              <summary>Дополнительные настройки</summary>

              <div class="form-group">
                <label>Сложность</label>
                <select v-model="currentQuestion.difficulty" class="type-select" :disabled="saving">
                  <option value="beginner">Начальный</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>

              <div class="form-group">
                <label>Изображение (URL)</label>
                <input
                    type="url"
                    v-model="currentQuestion.image_url"
                    placeholder="https://..."
                    class="form-input"
                    :disabled="saving"
                />
              </div>

              <div class="form-group">
                <label>Код (для вопросов по программированию)</label>
                <textarea
                    v-model="currentQuestion.code"
                    rows="4"
                    placeholder="Вставьте код..."
                    class="form-input code-input"
                    :disabled="saving"
                ></textarea>
              </div>

              <label class="checkbox">
                <input type="checkbox" v-model="currentQuestion.required" :disabled="saving" />
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
              <button @click="addQuestion" class="btn btn-primary" :disabled="saving">+ Добавить вопрос</button>
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
import { supabase } from '@/lib/supabase'
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
      isNewTest: false,
      loading: true,
      saving: false,
      publishing: false,
      error: null,
      currentQuestionIndex: 0,
      hasChanges: false,

      test: {
        id: null,
        title: '',
        description: '',
        status: 'draft',
        time_limit: 30,
        passing_score: 70,
        difficulty: 'intermediate',
        category: '',
        questions: []
      },

      originalTest: null // Для отслеживания изменений
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
    },

    canPublish() {
      return this.test.title &&
          this.test.questions.length > 0 &&
          this.test.questions.every(q => q.text &&
              (q.type === 'text' || (q.options && q.options.some(opt => opt.is_correct)))
          )
    }
  },
  watch: {
    test: {
      handler() {
        this.hasChanges = JSON.stringify(this.test) !== JSON.stringify(this.originalTest)
      },
      deep: true
    }
  },
  async created() {
    this.testId = this.$route.params.id
    this.isNewTest = this.testId === 'new'

    if (!this.isNewTest) {
      await this.loadTest()
    } else {
      this.initNewTest()
      this.loading = false
    }
  },
  methods: {
    initNewTest() {
      this.test = {
        id: 'new',
        title: 'Новый тест',
        description: '',
        status: 'draft',
        time_limit: 30,
        passing_score: 70,
        difficulty: 'intermediate',
        category: '',
        questions: []
      }
      this.originalTest = JSON.parse(JSON.stringify(this.test))
    },

    async loadTest() {
      this.loading = true
      this.error = null

      try {
        // Загружаем информацию о тесте
        const { data: testData, error: testError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', this.testId)
            .single()

        if (testError) throw testError
        if (!testData) throw new Error('Тест не найден')

        // Загружаем вопросы теста
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select(`
              id,
              text,
              type,
              points,
              explanation,
              hint,
              difficulty,
              image_url,
              code,
              required,
              "order",
              options (*)
            `)
            .eq('test_id', this.testId)
            .order('order', { ascending: true })

        if (questionsError) throw questionsError

        // Форматируем вопросы
        this.test = {
          ...testData,
          questions: (questionsData || []).map(q => ({
            id: q.id,
            text: q.text || '',
            type: q.type || 'single',
            points: q.points || 1,
            explanation: q.explanation || '',
            hint: q.hint || '',
            difficulty: q.difficulty || 'intermediate',
            image_url: q.image_url || '',
            code: q.code || '',
            required: q.required !== false,
            order: q.order,
            options: (q.options || []).sort((a, b) => a.order - b.order).map(o => ({
              id: o.id,
              text: o.text || '',
              is_correct: o.is_correct || false,
              order: o.order
            })),
            keywords: '' // Для текстовых вопросов
          }))
        }

        this.originalTest = JSON.parse(JSON.stringify(this.test))
        this.currentQuestionIndex = this.test.questions.length > 0 ? 0 : -1

      } catch (error) {
        console.error('Error loading test:', error)
        this.error = error.message || 'Не удалось загрузить тест'
      } finally {
        this.loading = false
      }
    },

    async saveTest() {
      if (!this.test.title) {
        alert('Введите название теста')
        return
      }

      this.saving = true
      this.error = null

      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          this.$router.push('/login')
          return
        }

        let testId = this.test.id

        if (this.isNewTest) {
          // Создаем новый тест
          const { data: newTest, error: createError } = await supabase
              .from('tests')
              .insert([{
                title: this.test.title,
                description: this.test.description || '',
                time_limit: this.test.time_limit,
                passing_score: this.test.passing_score,
                difficulty: this.test.difficulty,
                category: this.test.category,
                status: 'draft',
                created_by: user.id
              }])
              .select()
              .single()

          if (createError) throw createError

          testId = newTest.id
          this.test.id = testId
          this.isNewTest = false
        } else {
          // Обновляем существующий тест
          const { error: updateError } = await supabase
              .from('tests')
              .update({
                title: this.test.title,
                description: this.test.description,
                time_limit: this.test.time_limit,
                passing_score: this.test.passing_score,
                difficulty: this.test.difficulty,
                category: this.test.category,
                updated_at: new Date().toISOString()
              })
              .eq('id', this.test.id)

          if (updateError) throw updateError
        }

        // Сохраняем вопросы
        await this.saveQuestions(testId)

        // Обновляем оригинальную версию
        this.originalTest = JSON.parse(JSON.stringify(this.test))
        this.hasChanges = false

        alert('Тест успешно сохранен')

      } catch (error) {
        console.error('Error saving test:', error)
        this.error = 'Ошибка при сохранении теста'
        alert('Ошибка при сохранении теста')
      } finally {
        this.saving = false
      }
    },

    async saveQuestions(testId) {
      // Удаляем все существующие вопросы (для простоты)
      if (!this.isNewTest) {
        const { error: deleteOptionsError } = await supabase
            .from('options')
            .delete()
            .in('question_id', this.test.questions.map(q => q.id).filter(id => id && !id.toString().startsWith('temp')))

        if (deleteOptionsError) throw deleteOptionsError

        const { error: deleteQuestionsError } = await supabase
            .from('questions')
            .delete()
            .eq('test_id', testId)

        if (deleteQuestionsError) throw deleteQuestionsError
      }

      // Создаем новые вопросы
      for (let i = 0; i < this.test.questions.length; i++) {
        const q = this.test.questions[i]

        const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert([{
              test_id: testId,
              text: q.text || '',
              type: q.type,
              points: q.points || 1,
              explanation: q.explanation || '',
              hint: q.hint || '',
              difficulty: q.difficulty || 'intermediate',
              image_url: q.image_url || '',
              code: q.code || '',
              required: q.required,
              order: i
            }])
            .select()
            .single()

        if (questionError) throw questionError

        // Сохраняем options для single/multiple вопросов
        if (q.type === 'single' || q.type === 'multiple') {
          const options = q.options.map((opt, idx) => ({
            question_id: questionData.id,
            text: opt.text || '',
            is_correct: opt.is_correct || false,
            order: idx
          }))

          const { error: optionsError } = await supabase
              .from('options')
              .insert(options)

          if (optionsError) throw optionsError
        }

        // Обновляем ID вопроса в локальном состоянии
        q.id = questionData.id
      }
    },

    async publishTest() {
      if (!this.canPublish) {
        alert('Нельзя опубликовать тест: заполните все обязательные поля')
        return
      }

      this.publishing = true

      try {
        // Сначала сохраняем тест
        await this.saveTest()

        // Обновляем статус
        const { error } = await supabase
            .from('tests')
            .update({
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', this.test.id)

        if (error) throw error

        this.test.status = 'published'
        this.originalTest.status = 'published'
        alert('Тест успешно опубликован')

      } catch (error) {
        console.error('Error publishing test:', error)
        alert('Ошибка при публикации теста')
      } finally {
        this.publishing = false
      }
    },

    goBack() {
      if (this.hasChanges) {
        if (confirm('У вас есть несохраненные изменения. Выйти без сохранения?')) {
          this.$router.push('/teacher/tests')
        }
      } else {
        this.$router.push('/teacher/tests')
      }
    },

    addQuestion() {
      const newQuestion = {
        id: `temp_${Date.now()}`,
        type: 'single',
        text: '',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ],
        points: 1,
        explanation: '',
        difficulty: 'intermediate',
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
      question.id = `temp_${Date.now()}`
      this.test.questions.splice(index + 1, 0, question)
    },

    deleteQuestion(index) {
      if (!confirm('Удалить вопрос?')) return

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
        text: 'T'
      }
      return icons[type] || '○'
    },

    onQuestionTypeChange() {
      if (this.currentQuestion.type === 'single' || this.currentQuestion.type === 'multiple') {
        if (!this.currentQuestion.options || this.currentQuestion.options.length === 0) {
          this.currentQuestion.options = [
            { text: '', is_correct: false },
            { text: '', is_correct: false }
          ]
        }
      }
    },

    addOption() {
      if (this.currentQuestion) {
        this.currentQuestion.options.push({ text: '', is_correct: false })
      }
    },

    removeOption(index) {
      if (this.currentQuestion.options.length > 1) {
        this.currentQuestion.options.splice(index, 1)
      }
    },

    toggleCorrectOption(index) {
      const option = this.currentQuestion.options[index]

      if (this.currentQuestion.type === 'single') {
        // Для single - только один правильный
        this.currentQuestion.options.forEach((opt, i) => {
          opt.is_correct = i === index
        })
      } else {
        // Для multiple - переключаем
        option.is_correct = !option.is_correct
      }
    },

    isCorrectOption(index) {
      return this.currentQuestion.options[index]?.is_correct || false
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

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.error-state h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.error-state p {
  color: #666;
  margin-bottom: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Остальные стили остаются без изменений */
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

.title-input:disabled {
  background: transparent;
  color: #666;
  cursor: not-allowed;
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

.type-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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

.option-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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

.correct-checkbox input:disabled {
  cursor: not-allowed;
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

.points-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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

.checkbox input:disabled {
  cursor: not-allowed;
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

.icon-btn:hover:not(:disabled) {
  border-color: #111;
}

.icon-btn.delete:hover:not(:disabled) {
  border-color: #f44336;
  color: #f44336;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}
</style>