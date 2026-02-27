<template>
  <div class="teacher-profile">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="profile-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Загрузка профиля...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-state">
          <p class="error-icon">❌</p>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="loadProfile" class="btn btn-primary">Повторить</button>
        </div>

        <!-- Не авторизован -->
        <div v-else-if="!user" class="error-state">
          <p class="error-icon">🔒</p>
          <h3>Требуется авторизация</h3>
          <p>Пожалуйста, войдите в систему</p>
          <button @click="$router.push('/')" class="btn btn-primary">На главную</button>
        </div>

        <template v-else>
          <!-- Заголовок -->
          <div class="profile-header">
            <h1 class="profile-title">Личный кабинет преподавателя</h1>
            <p class="profile-subtitle">Управляйте своими данными и отслеживайте статистику</p>
          </div>

          <!-- Основной профиль -->
          <div class="profile-grid">
            <!-- Левая колонка: Аватар и основная информация -->
            <div class="profile-sidebar">
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <img
                      v-if="profile.avatar_url"
                      :src="profile.avatar_url"
                      :alt="profileFullName"
                      class="avatar-image"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ userInitials }}
                  </div>
                  <button class="avatar-edit" @click="openAvatarUpload" :disabled="uploading">
                    <span class="edit-icon">{{ uploading ? '⋯' : '✎' }}</span>
                  </button>
                </div>
                <h2 class="profile-name">{{ profileFullName }}</h2>
                <p class="profile-email">{{ user.email }}</p>
                <p class="profile-role">{{ roleLabel }}</p>
                <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
              </div>

              <div class="profile-stats-mini">
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.totalTests }}</span>
                  <span class="mini-stat-label">Всего тестов</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.publishedTests }}</span>
                  <span class="mini-stat-label">Опубликовано</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.totalStudents }}</span>
                  <span class="mini-stat-label">Студентов</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.totalAttempts }}</span>
                  <span class="mini-stat-label">Прохождений</span>
                </div>
              </div>

              <div class="profile-actions">
                <button @click="editProfile" class="btn btn-outline btn-block">
                  Редактировать профиль
                </button>
                <button @click="goToTests" class="btn btn-primary btn-block">
                  📋 Управление тестами
                </button>
              </div>
            </div>

            <!-- Правая колонка: Табы с контентом -->
            <div class="profile-content">
              <div class="profile-tabs">
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'overview' }"
                    @click="activeTab = 'overview'"
                >
                  Обзор
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'tests' }"
                    @click="activeTab = 'tests'"
                >
                  Мои тесты
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'students' }"
                    @click="activeTab = 'students'"
                >
                  Студенты
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'settings' }"
                    @click="activeTab = 'settings'"
                >
                  Настройки
                </button>
              </div>

              <div class="tab-content">
                <!-- Вкладка: Обзор -->
                <div v-if="activeTab === 'overview'" class="overview-tab">
                  <!-- Быстрая статистика -->
                  <div class="quick-stats">
                    <div class="quick-stat-card">
                      <span class="quick-stat-value">{{ stats.testsThisMonth }}</span>
                      <span class="quick-stat-label">Тестов за месяц</span>
                    </div>
                    <div class="quick-stat-card">
                      <span class="quick-stat-value">{{ stats.avgScore }}%</span>
                      <span class="quick-stat-label">Средний балл</span>
                    </div>
                    <div class="quick-stat-card">
                      <span class="quick-stat-value">{{ stats.passRate }}%</span>
                      <span class="quick-stat-label">Успеваемость</span>
                    </div>
                  </div>

                  <!-- График активности -->
                  <div class="chart-section">
                    <h3>Активность за последние 7 дней</h3>
                    <div class="chart-container">
                      <div v-if="dailyStats.length === 0" class="no-data-message">
                        Нет данных за этот период
                      </div>
                      <div v-else class="mini-chart">
                        <div v-for="(day, index) in dailyStats" :key="index" class="chart-column">
                          <div class="chart-bar" :style="{ height: day.percentage + '%' }"></div>
                          <span class="chart-label">{{ day.date }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Последние тесты -->
                  <div class="recent-tests">
                    <div class="section-header">
                      <h3>Последние тесты</h3>
                      <button @click="goToTests" class="btn-link">Все тесты →</button>
                    </div>
                    <div v-if="recentTests.length === 0" class="empty-state">
                      <p>У вас пока нет созданных тестов</p>
                      <button @click="createNewTest" class="btn btn-primary btn-sm">
                        Создать тест
                      </button>
                    </div>
                    <div v-else class="tests-list">
                      <div v-for="test in recentTests" :key="test.id" class="test-item">
                        <div class="test-info">
                          <h4>{{ test.title }}</h4>
                          <p>{{ test.attempts }} прохождений • {{ test.questions }} вопросов</p>
                        </div>
                        <div class="test-actions">
                          <span class="test-status" :class="test.status">
                            {{ statusLabel(test.status) }}
                          </span>
                          <button @click="editTest(test.id)" class="btn-link-small">
                            Подробнее
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Активные студенты -->
                  <div class="active-students">
                    <h3>Активные студенты</h3>
                    <div v-if="activeStudents.length === 0" class="empty-state">
                      <p>Нет активных студентов</p>
                    </div>
                    <div v-else class="students-list">
                      <div v-for="student in activeStudents" :key="student.id" class="student-item">
                        <div class="student-avatar-small">{{ student.initials }}</div>
                        <div class="student-info">
                          <span class="student-name">{{ student.name }}</span>
                          <span class="student-group">{{ student.group }}</span>
                        </div>
                        <span class="student-activity">{{ student.lastActive }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Вкладка: Мои тесты -->
                <div v-if="activeTab === 'tests'" class="tests-tab">
                  <div class="tab-header">
                    <h3>Мои тесты</h3>
                    <button @click="createNewTest" class="btn btn-primary btn-sm">
                      + Новый тест
                    </button>
                  </div>

                  <div class="tests-filters">
                    <input
                        type="text"
                        v-model="testSearch"
                        placeholder="Поиск по названию..."
                        class="search-input"
                    />
                    <select v-model="testStatusFilter" class="filter-select">
                      <option value="all">Все статусы</option>
                      <option value="published">Опубликовано</option>
                      <option value="draft">Черновики</option>
                      <option value="archived">В архиве</option>
                    </select>
                  </div>

                  <div v-if="filteredTests.length === 0" class="empty-state">
                    <p>Тесты не найдены</p>
                  </div>
                  <div v-else class="tests-table">
                    <table>
                      <thead>
                      <tr>
                        <th>Название</th>
                        <th>Вопросов</th>
                        <th>Прохождений</th>
                        <th>Средний балл</th>
                        <th>Статус</th>
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="test in filteredTests" :key="test.id">
                        <td>{{ test.title }}</td>
                        <td>{{ test.questions }}</td>
                        <td>{{ test.attempts }}</td>
                        <td>{{ test.avgScore }}%</td>
                        <td>
                            <span class="test-status" :class="test.status">
                              {{ statusLabel(test.status) }}
                            </span>
                        </td>
                        <td>
                          <button @click="editTest(test.id)" class="btn-link-small">
                            Отчеты
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Вкладка: Студенты -->
                <div v-if="activeTab === 'students'" class="students-tab">
                  <h3>Мои студенты</h3>

                  <div class="students-filters">
                    <input
                        type="text"
                        v-model="studentSearch"
                        placeholder="Поиск по имени или группе..."
                        class="search-input"
                    />
                    <select v-model="groupFilter" class="filter-select">
                      <option value="all">Все группы</option>
                      <option v-for="group in uniqueGroups" :key="group" :value="group">
                        {{ group }}
                      </option>
                    </select>
                  </div>

                  <div v-if="filteredStudents.length === 0" class="empty-state">
                    <p>Студенты не найдены</p>
                  </div>
                  <div v-else class="students-grid">
                    <div v-for="student in filteredStudents" :key="student.id" class="student-card">
                      <div class="student-avatar">{{ student.initials }}</div>
                      <div class="student-card-info">
                        <h4>{{ student.name }}</h4>
                        <p>{{ student.group }}</p>
                        <div class="student-stats">
                          <span>📊 {{ student.testsPassed }} тестов</span>
                          <span>⭐ {{ student.avgScore }}%</span>
                        </div>
                      </div>
                      <button @click="viewStudentProfile(student.id)" class="btn-link-small">
                        Профиль
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Вкладка: Настройки (аналогично студенческой, но с преподавательскими опциями) -->
                <div v-if="activeTab === 'settings'" class="settings-tab">
                  <form @submit.prevent="saveSettings" class="settings-form">
                    <!-- Основная информация -->
                    <div class="settings-section">
                      <h3>Основная информация</h3>

                      <div class="form-group">
                        <label for="first_name">Имя</label>
                        <input
                            type="text"
                            id="first_name"
                            v-model="settingsForm.first_name"
                            class="form-input"
                        />
                      </div>

                      <div class="form-group">
                        <label for="last_name">Фамилия</label>
                        <input
                            type="text"
                            id="last_name"
                            v-model="settingsForm.last_name"
                            class="form-input"
                        />
                      </div>

                      <div class="form-group">
                        <label for="patronymic">Отчество</label>
                        <input
                            type="text"
                            id="patronymic"
                            v-model="settingsForm.patronymic"
                            class="form-input"
                        />
                      </div>

                      <div class="form-group">
                        <label for="bio">О себе</label>
                        <textarea
                            id="bio"
                            v-model="settingsForm.bio"
                            rows="3"
                            class="form-input"
                        ></textarea>
                      </div>
                    </div>

                    <!-- Уведомления -->
                    <div class="settings-section">
                      <h3>Уведомления</h3>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.notifications.email" />
                        <span>Получать уведомления о новых прохождениях</span>
                      </label>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.notifications.results" />
                        <span>Уведомлять о результатах студентов</span>
                      </label>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.notifications.reminders" />
                        <span>Напоминания о дедлайнах</span>
                      </label>
                    </div>

                    <!-- Сменить пароль -->
                    <div class="settings-section">
                      <h3>Сменить пароль</h3>

                      <div class="form-group">
                        <label for="current-password">Текущий пароль</label>
                        <input
                            type="password"
                            id="current-password"
                            v-model="passwordData.current"
                            class="form-input"
                        />
                      </div>

                      <div class="form-group">
                        <label for="new-password">Новый пароль</label>
                        <input
                            type="password"
                            id="new-password"
                            v-model="passwordData.new"
                            class="form-input"
                        />
                      </div>

                      <div class="form-group">
                        <label for="confirm-password">Подтвердите пароль</label>
                        <input
                            type="password"
                            id="confirm-password"
                            v-model="passwordData.confirm"
                            class="form-input"
                        />
                      </div>

                      <button type="button" @click="changePassword" class="btn btn-outline">
                        Обновить пароль
                      </button>
                    </div>

                    <div class="settings-actions">
                      <button type="submit" class="btn btn-primary">Сохранить изменения</button>
                      <button type="button" @click="resetSettings" class="btn btn-outline">Отмена</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Модальное окно редактирования профиля -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal edit-modal">
        <h2 class="modal-title">Редактировать профиль</h2>

        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-group">
            <label for="edit-first_name">Имя</label>
            <input type="text" id="edit-first_name" v-model="editForm.first_name" class="form-input" />
          </div>

          <div class="form-group">
            <label for="edit-last_name">Фамилия</label>
            <input type="text" id="edit-last_name" v-model="editForm.last_name" class="form-input" />
          </div>

          <div class="form-group">
            <label for="edit-patronymic">Отчество</label>
            <input type="text" id="edit-patronymic" v-model="editForm.patronymic" class="form-input" />
          </div>

          <div class="form-group">
            <label for="edit-bio">О себе</label>
            <textarea id="edit-bio" v-model="editForm.bio" rows="4" class="form-input"></textarea>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" @click="showEditModal = false" class="btn btn-outline">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Футер -->
    <app-footer></app-footer>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import AppNavigation from '../components/navigation'
import AppFooter from '../components/footer'

export default {
  name: 'TeacherProfile',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      loading: true,
      uploading: false,
      error: null,
      activeTab: 'overview',
      showEditModal: false,

      // Пользователь
      user: null,
      profile: {},

      // Поиск и фильтры
      testSearch: '',
      testStatusFilter: 'all',
      studentSearch: '',
      groupFilter: 'all',

      // Формы
      editForm: {
        first_name: '',
        last_name: '',
        patronymic: '',
        bio: ''
      },

      settingsForm: {
        first_name: '',
        last_name: '',
        patronymic: '',
        bio: '',
        notifications: {
          email: true,
          results: true,
          reminders: false
        }
      },

      passwordData: {
        current: '',
        new: '',
        confirm: ''
      },

      // Статистика
      stats: {
        totalTests: 0,
        publishedTests: 0,
        totalStudents: 0,
        totalAttempts: 0,
        testsThisMonth: 0,
        avgScore: 0,
        passRate: 0
      },

      dailyStats: [],
      recentTests: [],
      activeStudents: [],
      allTests: [],
      allStudents: []
    }
  },
  computed: {
    profileFullName() {
      const parts = []
      if (this.profile.first_name) parts.push(this.profile.first_name)
      if (this.profile.last_name) parts.push(this.profile.last_name)
      if (this.profile.patronymic) parts.push(this.profile.patronymic)
      return parts.join(' ') || 'Преподаватель'
    },

    userInitials() {
      if (this.profile.first_name && this.profile.last_name) {
        return (this.profile.first_name[0] + this.profile.last_name[0]).toUpperCase()
      }
      return this.user?.email?.[0]?.toUpperCase() || 'П'
    },

    roleLabel() {
      if (this.profile.role === 'admin') return 'Администратор'
      return 'Преподаватель'
    },

    filteredTests() {
      let filtered = this.allTests

      if (this.testSearch) {
        const query = this.testSearch.toLowerCase()
        filtered = filtered.filter(t => t.title.toLowerCase().includes(query))
      }

      if (this.testStatusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === this.testStatusFilter)
      }

      return filtered
    },

    uniqueGroups() {
      const groups = new Set(this.allStudents.map(s => s.group).filter(Boolean))
      return Array.from(groups).sort()
    },

    filteredStudents() {
      let filtered = this.allStudents

      if (this.studentSearch) {
        const query = this.studentSearch.toLowerCase()
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.group?.toLowerCase().includes(query)
        )
      }

      if (this.groupFilter !== 'all') {
        filtered = filtered.filter(s => s.group === this.groupFilter)
      }

      return filtered
    }
  },
  async created() {
    await this.loadUser()
    if (this.user) {
      await this.loadProfile()
      await this.loadStats()
      await this.loadTests()
      await this.loadStudents()
    }
    this.loading = false
  },
  methods: {
    async loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        this.user = user
      } catch (error) {
        console.error('Error loading user:', error)
        this.error = 'Не удалось загрузить пользователя'
      }
    },

    async loadProfile() {
      if (!this.user) return

      try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', this.user.id)
            .single()

        if (error) throw error
        this.profile = data || {}

        // Инициализируем формы
        this.initForms()
      } catch (error) {
        console.error('Error loading profile:', error)
        this.error = 'Не удалось загрузить профиль'
      }
    },

    initForms() {
      this.editForm = {
        first_name: this.profile.first_name || '',
        last_name: this.profile.last_name || '',
        patronymic: this.profile.patronymic || '',
        bio: this.profile.bio || ''
      }

      this.settingsForm = {
        first_name: this.profile.first_name || '',
        last_name: this.profile.last_name || '',
        patronymic: this.profile.patronymic || '',
        bio: this.profile.bio || '',
        notifications: {
          email: true,
          results: true,
          reminders: false
        }
      }
    },

    async loadStats() {
      if (!this.user) return

      try {
        // Получаем все тесты преподавателя
        const { data: tests, error: testsError } = await supabase
            .from('tests')
            .select('id, status, created_at')
            .eq('created_by', this.user.id)

        if (testsError) throw testsError

        const totalTests = tests?.length || 0
        const publishedTests = tests?.filter(t => t.status === 'published').length || 0

        // Получаем попытки по всем тестам
        const testIds = tests?.map(t => t.id) || []

        let totalAttempts = 0
        let totalScore = 0
        let passedCount = 0

        if (testIds.length > 0) {
          const { data: attempts, error: attemptsError } = await supabase
              .from('attempts')
              .select('score, status')
              .in('test_id', testIds)
              .eq('status', 'completed')

          if (attemptsError) throw attemptsError

          totalAttempts = attempts?.length || 0
          totalScore = attempts?.reduce((sum, a) => sum + (a.score || 0), 0) || 0
          passedCount = attempts?.filter(a => a.score >= 70).length || 0
        }

        // Получаем количество студентов (уникальных пользователей, проходивших тесты)
        let totalStudents = 0
        if (testIds.length > 0) {
          const { data: students, error: studentsError } = await supabase
              .from('attempts')
              .select('user_id')
              .in('test_id', testIds)
              .not('user_id', 'is', null)

          if (studentsError) throw studentsError

          const uniqueStudents = new Set(students?.map(s => s.user_id) || [])
          totalStudents = uniqueStudents.size
        }

        // Тесты за последний месяц
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

        const testsThisMonth = tests?.filter(t => new Date(t.created_at) > oneMonthAgo).length || 0

        this.stats = {
          totalTests,
          publishedTests,
          totalStudents,
          totalAttempts,
          testsThisMonth,
          avgScore: totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0,
          passRate: totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0
        }

        // Генерируем дневную статистику
        this.generateDailyStats(tests || [])

      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },

    generateDailyStats(tests) {
      const last7Days = []
      const today = new Date()

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const dayTests = tests.filter(t =>
            t.created_at && t.created_at.startsWith(dateStr)
        )

        const max = Math.max(tests.length, 1)
        const percentage = dayTests.length > 0
            ? Math.round((dayTests.length / max) * 100)
            : 0

        last7Days.push({
          date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          count: dayTests.length,
          percentage: Math.min(percentage, 100)
        })
      }

      this.dailyStats = last7Days
    },

    async loadTests() {
      if (!this.user) return

      try {
        const { data: tests, error } = await supabase
            .from('tests')
            .select(`
              *,
              questions:questions(count)
            `)
            .eq('created_by', this.user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) throw error

        console.log('test result:', tests)

        this.allTests = tests?.map(t => ({
          ...t,
          questions: t.questions?.[0]?.count || 0,
          attempts: Math.floor(Math.random() * 50) + 10, // Заглушка, нужно будет добавить реальный подсчет
          avgScore: Math.floor(Math.random() * 30) + 60 // Заглушка
        })) || []

        this.recentTests = this.allTests.slice(0, 5)

      } catch (error) {
        console.error('Error loading tests:', error)
        this.allTests = []
        this.recentTests = []
      }
    },

    async loadStudents() {
      if (!this.user) return

      try {
        // Получаем всех студентов, проходивших тесты преподавателя
        const { data: tests } = await supabase
            .from('tests')
            .select('id')
            .eq('created_by', this.user.id)

        const testIds = tests?.map(t => t.id) || []

        if (testIds.length === 0) {
          this.allStudents = []
          this.activeStudents = []
          return
        }

        const { data: attempts, error: attemptsError } = await supabase
            .from('attempts')
            .select('user_id, score, completed_at')
            .in('test_id', testIds)
            .order('completed_at', { ascending: false })

        if (attemptsError) throw attemptsError

        const userIds = [...new Set(attempts?.map(a => a.user_id) || [])]

        if (userIds.length === 0) {
          this.allStudents = []
          this.activeStudents = []
          return
        }

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, group_name')
            .in('id', userIds)

        if (profilesError) throw profilesError

        // Формируем список студентов
        this.allStudents = profiles?.map(p => {
          const userAttempts = attempts?.filter(a => a.user_id === p.id) || []
          const avgScore = userAttempts.length > 0
              ? Math.round(userAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / userAttempts.length)
              : 0
          console.log(userAttempts)
          return {
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Студент',
            initials: ((p.first_name?.[0] || '') + (p.last_name?.[0] || '')).toUpperCase() || '?',
            group: p.group_name || 'Без группы',
            testsPassed: userAttempts.length,
            avgScore,
            lastActive: userAttempts[0]?.completed_at
          }
        }) || []
        console.log(this.allStudents)
        // Активные студенты (последние 5)
        this.activeStudents = [...this.allStudents]
            .sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0))
            .slice(0, 5)
            .map(s => ({
              ...s,
              lastActive: s.lastActive ? this.formatDate(s.lastActive) : 'Давно'
            }))

      } catch (error) {
        console.error('Error loading students:', error)
        this.allStudents = []
        this.activeStudents = []
      }
    },

    statusLabel(status) {
      const labels = {
        published: 'Опубликовано',
        draft: 'Черновик',
        archived: 'В архиве'
      }
      return labels[status] || status
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Сегодня'
      if (diffDays === 1) return 'Вчера'
      if (diffDays < 7) return `${diffDays} дня назад`
      return date.toLocaleDateString('ru-RU')
    },

    // Методы для работы с профилем
    editProfile() {
      this.editForm = {
        first_name: this.profile.first_name || '',
        last_name: this.profile.last_name || '',
        patronymic: this.profile.patronymic || '',
        bio: this.profile.bio || ''
      }
      this.showEditModal = true
    },

    async saveProfile() {
      try {
        const { error } = await supabase
            .from('profiles')
            .update({
              first_name: this.editForm.first_name,
              last_name: this.editForm.last_name,
              patronymic: this.editForm.patronymic,
              bio: this.editForm.bio,
              updated_at: new Date().toISOString()
            })
            .eq('id', this.user.id)

        if (error) throw error

        await this.loadProfile()
        this.showEditModal = false

      } catch (error) {
        console.error('Error saving profile:', error)
        alert('Ошибка при сохранении профиля')
      }
    },

    async openAvatarUpload() {
      // TODO: Реализовать загрузку аватара
      alert('Функция загрузки аватара будет доступна позже')
    },

    async saveSettings() {
      try {
        const { error } = await supabase
            .from('profiles')
            .update({
              first_name: this.settingsForm.first_name,
              last_name: this.settingsForm.last_name,
              patronymic: this.settingsForm.patronymic,
              bio: this.settingsForm.bio,
              updated_at: new Date().toISOString()
            })
            .eq('id', this.user.id)

        if (error) throw error

        await this.loadProfile()
        alert('Настройки сохранены')

      } catch (error) {
        console.error('Error saving settings:', error)
        alert('Ошибка при сохранении настроек')
      }
    },

    resetSettings() {
      this.settingsForm = {
        first_name: this.profile.first_name || '',
        last_name: this.profile.last_name || '',
        patronymic: this.profile.patronymic || '',
        bio: this.profile.bio || '',
        notifications: {
          email: true,
          results: true,
          reminders: false
        }
      }
    },

    async changePassword() {
      if (this.passwordData.new !== this.passwordData.confirm) {
        alert('Пароли не совпадают')
        return
      }

      if (this.passwordData.new.length < 6) {
        alert('Пароль должен быть не менее 6 символов')
        return
      }

      try {
        const { error } = await supabase.auth.updateUser({
          password: this.passwordData.new
        })

        if (error) throw error

        this.passwordData = {
          current: '',
          new: '',
          confirm: ''
        }

        alert('Пароль успешно изменен')

      } catch (error) {
        console.error('Error changing password:', error)
        alert('Ошибка при смене пароля')
      }
    },

    // Навигационные методы
    goToTests() {
      this.$router.push('/teacher/tests')
    },

    createNewTest() {
      this.$router.push('/teacher/test/new/edit')
    },

    editTest(testId) {
      this.$router.push(`/teacher/test/${testId}/reports`)
    },

    viewStudentProfile(studentId) {
      this.$router.push(`/profile/${studentId}`)
    },


  }
}
</script>

<style scoped>
/* Стили аналогичны StudentProfile с добавлением новых классов */

.teacher-profile {
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

/* Состояния загрузки и ошибок */
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

.no-data-message {
  padding: 40px;
  text-align: center;
  color: #999;
  background: #f5f5f5;
  border: 1px solid #eee;
}

/* Основной контент */
.profile-main {
  padding: 120px 0 60px;
  flex: 1;
}

.profile-header {
  text-align: center;
  margin-bottom: 48px;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  line-height: 1.2;
}

.profile-subtitle {
  color: #666;
  font-size: 1rem;
}

/* Сетка профиля */
.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
}

/* Боковая панель */
.profile-sidebar {
  background: white;
  border: 1px solid #eee;
  padding: 32px 24px;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 450;
  color: #999;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-edit:hover:not(:disabled) {
  border-color: #111;
}

.avatar-edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-icon {
  font-size: 1rem;
  color: #666;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.profile-email {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.profile-role {
  color: #999;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.profile-bio {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.profile-stats-mini {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 24px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
  text-align: center;
}

.mini-stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 450;
  line-height: 1.2;
  margin-bottom: 4px;
}

.mini-stat-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Основной контент */
.profile-content {
  background: white;
  border: 1px solid #eee;
  padding: 32px;
}

.profile-tabs {
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
  position: relative;
}

.tab-btn:hover {
  color: #111;
}

.tab-btn.active {
  color: #111;
  font-weight: 500;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -17px;
  left: 0;
  right: 0;
  height: 2px;
  background: #111;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* Быстрая статистика */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.quick-stat-card {
  background: #fafafa;
  border: 1px solid #eee;
  padding: 20px;
  text-align: center;
}

.quick-stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 450;
  line-height: 1.2;
  margin-bottom: 8px;
}

.quick-stat-label {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* График */
.chart-section {
  margin-bottom: 32px;
}

.chart-section h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.chart-container {
  height: 200px;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #eee;
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

/* Списки тестов и студентов */
.tests-list,
.students-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-item,
.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f5f5f5;
  transition: border-color 0.2s;
}

.test-item:hover,
.student-item:hover {
  border-color: #eee;
}

.test-info h4,
.student-info h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.test-info p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.test-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.test-status {
  padding: 2px 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  border: 1px solid;
}

.test-status.published {
  border-color: #4caf50;
  color: #2e7d32;
}

.test-status.draft {
  border-color: #ff9800;
  color: #f57c00;
}

.test-status.archived {
  border-color: #999;
  color: #666;
}

.student-avatar-small {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
  margin-left: 12px;
}

.student-name {
  display: block;
  font-weight: 500;
  font-size: 0.95rem;
}

.student-group {
  font-size: 0.85rem;
  color: #999;
}

.student-activity {
  color: #999;
  font-size: 0.85rem;
}

/* Таблица тестов */
.tests-table {
  overflow-x: auto;
}

.tests-table table {
  width: 100%;
  border-collapse: collapse;
}

.tests-table th {
  text-align: left;
  padding: 16px 12px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #999;
  border-bottom: 1px solid #eee;
}

.tests-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f5f5f5;
}

/* Сетка студентов */
.students-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #f5f5f5;
  transition: border-color 0.2s;
}

.student-card:hover {
  border-color: #eee;
}

.student-avatar {
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.student-card-info {
  flex: 1;
}

.student-card-info h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.student-card-info p {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.student-stats {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #999;
}

/* Фильтры */
.tests-filters,
.students-filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input,
.filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  background: white;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #111;
}

/* Пустое состояние */
.empty-state {
  padding: 40px;
  text-align: center;
  border: 1px solid #eee;
  color: #999;
  background: #fafafa;
}

.empty-state p {
  margin-bottom: 16px;
}

/* Настройки */
.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.settings-section h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 20px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #666;
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

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #666;
  font-size: 0.95rem;
}

.checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.settings-actions {
  display: flex;
  gap: 12px;
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
  max-width: 500px;
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 450;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* Кнопки */
.btn {
  display: inline-block;
  padding: 10px 20px;
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

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-link {
  background: none;
  border: none;
  color: #111;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  font-size: 0.9rem;
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

/* Адаптивность */
@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    position: static;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-title {
    font-size: 2rem;
  }

  .profile-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
  }

  .tab-btn.active::after {
    display: none;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .tests-filters,
  .students-filters {
    grid-template-columns: 1fr;
  }

  .test-item,
  .student-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .student-card {
    flex-direction: column;
    text-align: center;
  }

  .student-stats {
    justify-content: center;
  }

  .settings-actions {
    flex-direction: column;
  }

  .modal {
    padding: 24px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>