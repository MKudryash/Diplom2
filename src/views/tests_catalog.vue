<template>
  <div class="catalog">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Хедер каталога -->
    <section class="catalog-header">
      <div class="container">
        <div class="header-content">
          <h1 class="catalog-title">Каталог тестов</h1>
          <p class="catalog-subtitle">
            {{ filteredTests.length }} {{ pluralize(filteredTests.length, ['тест', 'теста', 'тестов']) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Фильтры и поиск -->
    <section class="filters">
      <div class="container">
        <div class="filters-grid">
          <div class="search-wrapper">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Поиск по названию или описанию..."
                class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>

          <div class="filter-group">
            <label>Категория</label>
            <select v-model="selectedCategory" class="filter-select">
              <option value="all">Все категории</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Сложность</label>
            <select v-model="selectedDifficulty" class="filter-select">
              <option value="all">Любая</option>
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Сортировка</label>
            <select v-model="sortBy" class="filter-select">
              <option value="popular">По популярности</option>
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="nameAsc">По имени (А-Я)</option>
              <option value="nameDesc">По имени (Я-А)</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Сетка тестов -->
    <section class="tests-grid-section">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка тестов...</p>
        </div>

        <!-- Нет результатов -->
        <div v-else-if="filteredTests.length === 0" class="empty-state">
          <p class="empty-icon">📋</p>
          <h3>Тесты не найдены</h3>
          <p>Попробуйте изменить параметры поиска</p>
          <button @click="resetFilters" class="btn btn-outline">
            Сбросить фильтры
          </button>
        </div>

        <!-- Сетка -->
        <div v-else class="tests-grid">
          <div
              v-for="test in paginatedTests"
              :key="test.id"
              class="test-card"
              @click="openTest(test)"
          >
            <div class="test-header">
              <span class="test-category">{{ test.category }}</span>
              <span class="test-difficulty" :class="test.difficulty">
                {{ difficultyLabel(test.difficulty) }}
              </span>
            </div>

            <h3 class="test-title">{{ test.title }}</h3>
            <p class="test-description">{{ test.description }}</p>

            <div class="test-meta">
              <div class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span>{{ test.questions_count || test.questions }} вопросов</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🕒</span>
                <span>{{ test.time_limit }} мин</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <span>{{ formatNumber(test.attempts_count || 0) }}</span>
              </div>
            </div>

            <div class="test-footer">
              <div class="test-author">
                <span class="author-icon">👤</span>
                <span>{{ test.author_name || 'Преподаватель' }}</span>
              </div>
              <button class="btn btn-primary btn-sm">Начать</button>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="filteredTests.length > pageSize" class="pagination">
          <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="pagination-btn"
          >
            ←
          </button>
          <span class="pagination-info">
            {{ currentPage }} из {{ totalPages }}
          </span>
          <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
          >
            →
          </button>
        </div>
      </div>
    </section>

    <!-- Футер -->
    <app-footer></app-footer>

    <!-- Модальное окно деталей теста -->
    <div v-if="selectedTest" class="modal-overlay" @click.self="selectedTest = null">
      <div class="modal test-detail-modal">
        <button class="modal-close" @click="selectedTest = null">×</button>

        <div class="test-detail">
          <div class="detail-header">
            <div class="header-row">
              <span class="detail-category">{{ selectedTest.category }}</span>
              <span class="detail-difficulty" :class="selectedTest.difficulty">
                {{ difficultyLabel(selectedTest.difficulty) }}
              </span>
            </div>
            <h2 class="detail-title">{{ selectedTest.title }}</h2>
          </div>

          <div class="detail-meta-grid">
            <div class="detail-meta-item">
              <span class="meta-label">Вопросов</span>
              <span class="meta-value">{{ selectedTest.questions_count || selectedTest.questions }}</span>
            </div>
            <div class="detail-meta-item">
              <span class="meta-label">Время</span>
              <span class="meta-value">{{ selectedTest.time_limit }} мин</span>
            </div>
            <div class="detail-meta-item">
              <span class="meta-label">Прошли</span>
              <span class="meta-value">{{ formatNumber(selectedTest.attempts_count || 0) }}</span>
            </div>
            <div class="detail-meta-item">
              <span class="meta-label">Проходной</span>
              <span class="meta-value">{{ selectedTest.passing_score }}%</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>Описание</h3>
            <p>{{ selectedTest.description }}</p>
          </div>

          <div class="detail-section" v-if="selectedTest.learnings && selectedTest.learnings.length">
            <h3>Что вы узнаете</h3>
            <ul class="detail-list">
              <li v-for="(item, index) in selectedTest.learnings" :key="index">
                ✓ {{ item }}
              </li>
            </ul>
          </div>

          <div class="detail-section" v-if="selectedTest.requirements && selectedTest.requirements.length">
            <h3>Требования</h3>
            <ul class="detail-list">
              <li v-for="(req, index) in selectedTest.requirements" :key="index">
                • {{ req }}
              </li>
            </ul>
          </div>

          <div class="detail-actions">
            <button class="btn btn-primary btn-large" @click="startTest(selectedTest)">
              Начать тест
            </button>
            <button class="btn btn-outline btn-large" @click="selectedTest = null">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import AppNavigation from '../components/navigation'
import AppFooter from '../components/footer'

export default {
  name: 'TestsCatalog',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      loading: true,
      searchQuery: '',
      selectedCategory: 'all',
      selectedDifficulty: 'all',
      sortBy: 'popular',
      currentPage: 1,
      pageSize: 9,
      selectedTest: null,

      // Данные из Supabase
      tests: [],
      categories: [],

      // Для fallback, если данные не загрузятся
      usingFallbackData: false
    }
  },
  computed: {
    filteredTests() {
      let filtered = this.tests

      // Поиск по тексту
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(test =>
            test.title.toLowerCase().includes(query) ||
            (test.description && test.description.toLowerCase().includes(query)) ||
            (test.category && test.category.toLowerCase().includes(query))
        )
      }

      // Фильтр по категории
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(test => test.category === this.selectedCategory)
      }

      // Фильтр по сложности
      if (this.selectedDifficulty !== 'all') {
        filtered = filtered.filter(test => test.difficulty === this.selectedDifficulty)
      }

      // Сортировка
      filtered = this.sortTests(filtered)

      return filtered
    },
    totalPages() {
      return Math.ceil(this.filteredTests.length / this.pageSize)
    },
    paginatedTests() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredTests.slice(start, end)
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    selectedCategory() {
      this.currentPage = 1
    },
    selectedDifficulty() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    }
  },
  async created() {
    await this.fetchTests()
  },
  methods: {
    async fetchTests() {
      this.loading = true

      try {
        // Получаем опубликованные тесты
        const { data: testsData, error: testsError } = await supabase
            .from('tests')
            .select(`
            id,
            title,
            description,
            difficulty,
            time_limit,
            passing_score,
            category,
            tags,
            created_by,
            created_at,
            profiles:created_by (
              first_name,
              last_name
            )
          `)
            .eq('status', 'published')
            .order('created_at', { ascending: false })

        if (testsError) throw testsError

        // Для каждого теста получаем количество вопросов
        const testsWithDetails = await Promise.all((testsData || []).map(async (test) => {
          // Количество вопросов
          const { count: questionsCount, error: questionsError } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('test_id', test.id)

          if (questionsError) console.error('Error fetching questions count:', questionsError)

          // Количество попыток (упрощенно - общее количество)
          const { count: attemptsCount, error: attemptsError } = await supabase
              .from('attempts')
              .select('*', { count: 'exact', head: true })
              .eq('test_id', test.id)
              .eq('status', 'completed')

          if (attemptsError) console.error('Error fetching attempts count:', attemptsError)

          // Формируем имя автора
          const authorName = test.profiles
              ? `${test.profiles.first_name || ''} ${test.profiles.last_name || ''}`.trim()
              : 'Преподаватель'

          return {
            ...test,
            questions: questionsCount || 0,
            attempts: attemptsCount || 0,
            author: authorName || 'Преподаватель',
            rating: 4.5, // Заглушка, в реальности нужно вычислять
            learnings: [], // Эти данные нужно хранить отдельно или генерировать
            requirements: [] // Эти данные нужно хранить отдельно или генерировать
          }
        }))

        this.tests = testsWithDetails

        // Получаем уникальные категории
        const uniqueCategories = [...new Set(testsWithDetails.map(t => t.category).filter(Boolean))]
        this.categories = uniqueCategories.sort()

        // Если тестов нет, используем fallback данные
        if (this.tests.length === 0) {
          console.log('No tests found, using fallback data')
          this.useFallbackData()
        }

      } catch (error) {
        console.error('Error fetching tests:', error)
        this.useFallbackData()
      } finally {
        this.loading = false
      }
    },

    useFallbackData() {
      this.usingFallbackData = true

      // Тестовые данные из исходного компонента
      this.tests = [
        {
          id: '1',
          title: 'Основы JavaScript',
          description: 'Проверьте свои знания основ JavaScript: переменные, типы данных, функции, циклы.',
          category: 'Программирование',
          difficulty: 'beginner',
          questions: 25,
          time_limit: 30,
          attempts: 15420,
          rating: 4.8,
          author: 'Анна К.',
          learnings: [
            'Основы синтаксиса JavaScript',
            'Работа с переменными и типами данных',
            'Функции и области видимости',
            'Циклы и условные операторы'
          ],
          requirements: [
            'Базовое понимание программирования',
            'Желание учиться'
          ]
        },
        {
          id: '2',
          title: 'Python для начинающих',
          description: 'Изучите основы Python и научитесь писать первые программы.',
          category: 'Программирование',
          difficulty: 'beginner',
          questions: 30,
          time_limit: 40,
          attempts: 12350,
          rating: 4.9,
          author: 'Михаил С.',
          learnings: [
            'Синтаксис Python',
            'Работа со строками и числами',
            'Списки и словари',
            'Функции и модули'
          ],
          requirements: [
            'Базовые навыки работы с компьютером',
            'Английский на уровне чтения документации'
          ]
        },
        {
          id: '3',
          title: 'Продвинутый JavaScript',
          description: 'Сложные концепции JavaScript: замыкания, прототипы, асинхронность.',
          category: 'Программирование',
          difficulty: 'advanced',
          questions: 40,
          time_limit: 60,
          attempts: 8760,
          rating: 4.7,
          author: 'Дмитрий В.',
          learnings: [
            'Замыкания и лексическое окружение',
            'Прототипное наследование',
            'Асинхронность: промисы, async/await',
            'Событийный цикл'
          ],
          requirements: [
            'Уверенное знание основ JavaScript',
            'Опыт написания небольших скриптов'
          ]
        },
        {
          id: '4',
          title: 'Общая биология',
          description: 'Тест по основным разделам биологии для старшеклассников.',
          category: 'Биология',
          difficulty: 'intermediate',
          questions: 50,
          time_limit: 45,
          attempts: 6230,
          rating: 4.6,
          author: 'Елена М.',
          learnings: [
            'Клеточная теория',
            'Генетика и эволюция',
            'Экосистемы',
            'Анатомия человека'
          ],
          requirements: [
            'Школьный курс биологии',
            'Подготовка к ЕГЭ'
          ]
        },
        {
          id: '5',
          title: 'История России XX век',
          description: 'Проверьте знание ключевых событий российской истории прошлого века.',
          category: 'История',
          difficulty: 'intermediate',
          questions: 35,
          time_limit: 40,
          attempts: 4820,
          rating: 4.5,
          author: 'Александр И.',
          learnings: [
            'Революция и Гражданская война',
            'Великая Отечественная война',
            'Оттепель и застой',
            'Перестройка'
          ],
          requirements: [
            'Школьный курс истории',
            'Интерес к истории России'
          ]
        },
        {
          id: '6',
          title: 'Линейная алгебра',
          description: 'Тест по матрицам, векторам и системам линейных уравнений.',
          category: 'Математика',
          difficulty: 'advanced',
          questions: 20,
          time_limit: 50,
          attempts: 3150,
          rating: 4.8,
          author: 'Николай П.',
          learnings: [
            'Матрицы и операции с ними',
            'Определители',
            'Системы линейных уравнений',
            'Векторные пространства'
          ],
          requirements: [
            'Знание школьной алгебры',
            'Студенты технических специальностей'
          ]
        },
        {
          id: '7',
          title: 'Английский Intermediate',
          description: 'Проверьте свой уровень владения английским языком.',
          category: 'Языки',
          difficulty: 'intermediate',
          questions: 60,
          time_limit: 45,
          attempts: 9870,
          rating: 4.7,
          author: 'Мария Л.',
          learnings: [
            'Грамматика среднего уровня',
            'Лексика для повседневного общения',
            'Чтение и понимание текстов',
            'Аудирование'
          ],
          requirements: [
            'Уровень Pre-Intermediate',
            'Желание проверить свои знания'
          ]
        },
        {
          id: '8',
          title: 'HR для начинающих',
          description: 'Основы управления персоналом и HR-процессов.',
          category: 'Бизнес',
          difficulty: 'beginner',
          questions: 25,
          time_limit: 30,
          attempts: 2100,
          rating: 4.4,
          author: 'Светлана К.',
          learnings: [
            'Поиск и подбор персонала',
            'Адаптация сотрудников',
            'Оценка и развитие',
            'Кадровое делопроизводство'
          ],
          requirements: [
            'Начинающие HR-специалисты',
            'Руководители малого бизнеса'
          ]
        },
        {
          id: '9',
          title: 'Adobe Photoshop',
          description: 'Тест по инструментам и техникам работы в Photoshop.',
          category: 'Дизайн',
          difficulty: 'intermediate',
          questions: 30,
          time_limit: 35,
          attempts: 4320,
          rating: 4.6,
          author: 'Алексей Р.',
          learnings: [
            'Инструменты выделения',
            'Работа со слоями и масками',
            'Цветокоррекция',
            'Ретушь'
          ],
          requirements: [
            'Базовое знакомство с Photoshop',
            'Графический планшет (желательно)'
          ]
        }
      ]

      // Обновляем категории
      this.categories = [...new Set(this.tests.map(t => t.category))].sort()
    },

    difficultyLabel(difficulty) {
      const labels = {
        beginner: 'Начальный',
        intermediate: 'Средний',
        advanced: 'Продвинутый'
      }
      return labels[difficulty] || difficulty
    },

    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    },

    pluralize(count, forms) {
      const cases = [2, 0, 1, 1, 1, 2]
      return forms[
          count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
          ]
    },

    sortTests(tests) {
      const sorted = [...tests]

      switch (this.sortBy) {
        case 'popular':
          return sorted.sort((a, b) => (b.attempts || 0) - (a.attempts || 0))
        case 'newest':
          return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        case 'oldest':
          return sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        case 'nameAsc':
          return sorted.sort((a, b) => a.title.localeCompare(b.title))
        case 'nameDesc':
          return sorted.sort((a, b) => b.title.localeCompare(a.title))
        default:
          return sorted
      }
    },

    resetFilters() {
      this.searchQuery = ''
      this.selectedCategory = 'all'
      this.selectedDifficulty = 'all'
      this.sortBy = 'popular'
    },

    openTest(test) {
      this.selectedTest = test
    },

    async startTest(test) {
      // Проверяем, авторизован ли пользователь
      const {data, error} = await supabase.auth.signInWithPassword({
        email: 'student1@example.com',
        password: '1',
      })
      console.log(data)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Если не авторизован, показываем модалку входа
        this.$emit('open-login')
        return
      }
      console.log(user)
      // Переходим на страницу начала теста
      this.$router.push(`/test/${test.id}/take`)
    }
  }
}
</script>


<style scoped>
.catalog {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Хедер каталога */
.catalog-header {
  padding: 120px 0 40px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.header-content {
  text-align: center;
}

.catalog-title {
  font-size: 3rem;
  font-weight: 450;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
  line-height: 1.2;
}

.catalog-subtitle {
  color: #666;
  font-size: 1rem;
}

/* Фильтры */
.filters {
  padding: 24px 0;
  border-bottom: 1px solid #eee;
  background: white;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 20px;
  align-items: end;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: all 0.2s;
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
  font-size: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

/* Сетка тестов */
.tests-grid-section {
  padding: 60px 0 80px;
  flex: 1;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 48px;
}

.test-card {
  border: 1px solid #eee;
  padding: 24px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: white;
  display: flex;
  flex-direction: column;
}

.test-card:hover {
  border-color: #111;
  transform: translateY(-2px);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 0.85rem;
}

.test-category {
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.test-difficulty {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
}

.test-difficulty.beginner {
  border-color: #4caf50;
  color: #2e7d32;
}

.test-difficulty.intermediate {
  border-color: #ff9800;
  color: #f57c00;
}

.test-difficulty.advanced {
  border-color: #f44336;
  color: #c62828;
}

.test-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 12px;
  line-height: 1.4;
}

.test-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.6;
  flex: 1;
}

.test-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 1rem;
}

.test-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-author {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.author-icon {
  font-size: 1rem;
}

/* Пагинация */
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
  font-size: 1rem;
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
  font-size: 0.95rem;
}

/* Состояния загрузки и пустые состояния */
.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.loader {
  width: 40px;
  height: 40px;
  border: 2px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

/* Модальное окно */
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
  max-width: 600px;
  position: relative;
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #999;
  padding: 0;
}

.modal-close:hover {
  color: #111;
}

/* Детали теста */
.test-detail-modal {
  max-width: 600px;
}

.detail-header {
  margin-bottom: 32px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-category {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-difficulty {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
}

.detail-difficulty.beginner {
  border-color: #4caf50;
  color: #2e7d32;
}

.detail-difficulty.intermediate {
  border-color: #ff9800;
  color: #f57c00;
}

.detail-difficulty.advanced {
  border-color: #f44336;
  color: #c62828;
}

.detail-title {
  font-size: 2rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 24px;
  background: #fafafa;
  margin-bottom: 32px;
  border: 1px solid #eee;
}

.detail-meta-item {
  text-align: center;
}

.meta-label {
  display: block;
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.meta-value {
  font-size: 1.5rem;
  font-weight: 450;
  line-height: 1.2;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.detail-section p {
  color: #666;
  line-height: 1.6;
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-list li {
  padding: 4px 0;
  color: #666;
}

.detail-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
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

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tests-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .catalog-title {
    font-size: 2.5rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .tests-grid {
    grid-template-columns: 1fr;
  }

  .detail-meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>