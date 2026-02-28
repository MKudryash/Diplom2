<template>
  <div class="student-profile">
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
            <h1 class="profile-title">Профиль студента</h1>
            <p class="profile-subtitle">Управляйте своими данными и просматривайте статистику</p>
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
                <h2 class="student-name">{{ profileFullName }}</h2>
                <p class="student-email">{{ user.email }}</p>
                <p class="student-group">{{ profile.group_name || 'Без группы' }}</p>
                <p v-if="profile.bio" class="student-bio">{{ profile.bio }}</p>
              </div>

              <div class="profile-stats-mini">
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.testsPassed }}</span>
                  <span class="mini-stat-label">Тестов пройдено</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.averageScore }}%</span>
                  <span class="mini-stat-label">Средний результат</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-value">{{ stats.daysActive }}</span>
                  <span class="mini-stat-label">Дней на платформе</span>
                </div>
              </div>

              <div class="profile-actions">
                <button @click="editProfile" class="btn btn-outline btn-block">
                  Редактировать профиль
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
                    :class="{ active: activeTab === 'progress' }"
                    @click="activeTab = 'progress'"
                >
                  Прогресс
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'achievements' }"
                    @click="activeTab = 'achievements'"
                >
                  Достижения
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
                  <div class="recent-activity">
                    <h3>Недавняя активность</h3>
                    <div v-if="recentActivity.length === 0" class="empty-state">
                      <p>Нет недавней активности</p>
                    </div>
                    <div v-else class="activity-list">
                      <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
                        <span class="activity-icon">{{ activity.icon }}</span>
                        <div class="activity-details">
                          <p class="activity-title">{{ activity.title }}</p>
                          <p class="activity-meta">{{ activity.date }} • {{ activity.score }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="upcoming-tests">
                    <h3>Предстоящие тесты</h3>
                    <div v-if="upcomingTests.length === 0" class="empty-state">
                      <p>Нет назначенных тестов</p>
                    </div>
                    <div v-else class="upcoming-list">
                      <div v-for="test in upcomingTests" :key="test.id" class="upcoming-item">
                        <span class="upcoming-icon">📅</span>
                        <div class="upcoming-details">
                          <p class="upcoming-title">{{ test.title }}</p>
                          <p class="upcoming-meta">Дедлайн: {{ formatDate(test.deadline) }}</p>
                        </div>
                        <button @click="startTest(test.id)" class="btn btn-sm btn-primary">
                          Начать
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Вкладка: Прогресс -->
                <div v-if="activeTab === 'progress'" class="progress-tab">
                  <div class="progress-chart">
                    <h3>Динамика результатов</h3>
                    <div class="chart-placeholder">
                      <div v-if="progressData.length === 0" class="no-data-message">
                        Нет данных для графика
                      </div>
                      <div v-else class="mini-chart">
                        <div v-for="(point, index) in progressData" :key="index"
                             class="chart-bar"
                             :style="{ height: point.value + '%' }">
                          <span class="bar-label">{{ point.label }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="category-progress">
                    <h3>Прогресс по категориям</h3>
                    <div v-if="categoryProgress.length === 0" class="empty-state">
                      <p>Нет данных по категориям</p>
                    </div>
                    <div v-else class="category-list">
                      <div v-for="cat in categoryProgress" :key="cat.name" class="category-item">
                        <div class="category-header">
                          <span class="category-name">{{ cat.name }}</span>
                          <span class="category-score">{{ cat.correct }}/{{ cat.total }}</span>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: cat.percentage + '%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="recent-results">
                    <h3>Последние результаты</h3>
                    <div v-if="recentResults.length === 0" class="empty-state">
                      <p>Нет результатов</p>
                    </div>
                    <table v-else class="results-table">
                      <thead>
                      <tr>
                        <th>Тест</th>
                        <th>Дата</th>
                        <th>Результат</th>
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="result in recentResults" :key="result.id">
                        <td>{{ result.title }}</td>
                        <td>{{ formatDate(result.date) }}</td>
                        <td>
                          <span class="result-badge" :class="{
                            'good': result.score >= 80,
                            'medium': result.score >= 60 && result.score < 80,
                            'bad': result.score < 60
                          }">
                            {{ result.score }}%
                          </span>
                        </td>
                        <td>
                          <button @click="viewResult(result.id)" class="btn-link-small">Подробнее</button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Вкладка: Достижения -->
                <div v-if="activeTab === 'achievements'" class="achievements-tab">
                  <div v-if="achievements.length === 0" class="empty-state">
                    <p>Нет достижений</p>
                  </div>
                  <div v-else class="achievements-grid">
                    <div v-for="ach in achievements" :key="ach.id" class="achievement-card" :class="{ unlocked: ach.unlocked }">
                      <div class="achievement-icon">{{ ach.icon }}</div>
                      <div class="achievement-info">
                        <h4>{{ ach.title }}</h4>
                        <p>{{ ach.description }}</p>
                      </div>
                      <div v-if="ach.unlocked" class="achievement-check">✓</div>
                      <div v-else class="achievement-lock">🔒</div>
                    </div>
                  </div>
                </div>

                <!-- Вкладка: Настройки -->
                <div v-if="activeTab === 'settings'" class="settings-tab">
                  <form @submit.prevent="saveSettings" class="settings-form">
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
                        <label for="group_name">Группа</label>
                        <input
                            type="text"
                            id="group_name"
                            v-model="settingsForm.group_name"
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

                    <div class="settings-section">
                      <h3>Уведомления</h3>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.notifications.email" />
                        <span>Получать уведомления о новых тестах по email</span>
                      </label>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.notifications.results" />
                        <span>Уведомлять о результатах тестов</span>
                      </label>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.notifications.reminders" />
                        <span>Напоминания о дедлайнах</span>
                      </label>
                    </div>

                    <div class="settings-section">
                      <h3>Конфиденциальность</h3>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.privacy.showProgress" />
                        <span>Показывать мой прогресс другим студентам группы</span>
                      </label>

                      <label class="checkbox">
                        <input type="checkbox" v-model="settingsForm.privacy.showAchievements" />
                        <span>Показывать мои достижения</span>
                      </label>
                    </div>

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
            <label for="edit-group_name">Группа</label>
            <input type="text" id="edit-group_name" v-model="editForm.group_name" class="form-input" />
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
  name: 'StudentProfile',
  components: {
    AppNavigation,
    AppFooter,
  },
  data() {
    return {
      activeTab: 'overview',
      showEditModal: false,
      loading: true,
      uploading: false,
      error: null,

      user: null,
      profile: {},

      // Статистика
      stats: {
        testsPassed: 0,
        averageScore: 0,
        daysActive: 0
      },

      // Данные для вкладок
      recentActivity: [],
      upcomingTests: [],
      progressData: [],
      categoryProgress: [],
      recentResults: [],
      achievements: [],

      // Форма редактирования
      editForm: {
        first_name: '',
        last_name: '',
        patronymic: '',
        group_name: '',
        bio: ''
      },

      // Настройки
      settingsForm: {
        first_name: '',
        last_name: '',
        patronymic: '',
        group_name: '',
        bio: '',
        notifications: {
          email: true,
          results: true,
          reminders: false
        },
        privacy: {
          showProgress: true,
          showAchievements: false
        }
      },

      // Данные для смены пароля
      passwordData: {
        current: '',
        new: '',
        confirm: ''
      }
    }
  },
  computed: {
    profileFullName() {
      const parts = []
      if (this.profile.first_name) parts.push(this.profile.first_name)
      if (this.profile.last_name) parts.push(this.profile.last_name)
      if (this.profile.patronymic) parts.push(this.profile.patronymic)
      return parts.join(' ') || 'Студент'
    },

    userInitials() {
      if (this.profile.first_name && this.profile.last_name) {
        return (this.profile.first_name[0] + this.profile.last_name[0]).toUpperCase()
      }
      return this.user?.email?.[0]?.toUpperCase() || '?'
    }
  },
  async created() {
    await this.loadUser()
    if (this.user) {
      await this.loadProfile()
      await this.loadStats()
      await this.loadRecentActivity()
      await this.loadUpcomingTests()
      await this.loadProgressData()
      await this.loadCategoryProgress()
      await this.loadRecentResults()
      await this.loadAchievements()
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
            .select('*,user_settings(*)')
            .eq('id', this.user.id)
            .single()

        if (error) throw error

        this.profile = data || {}

        console.log(this.profile)
        this.settingsForm = data.user_settings

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
        group_name: this.profile.group_name || '',
        bio: this.profile.bio || ''
      }

      this.settingsForm = {
        first_name: this.profile.first_name || '',
        last_name: this.profile.last_name || '',
        patronymic: this.profile.patronymic || '',
        group_name: this.profile.group_name || '',
        bio: this.profile.bio || '',
        notifications: {
          email: this.profile.user_settings.email_notifications,
          results: this.profile.user_settings.result_notifications,
          reminders: this.profile.user_settings.reminder_notification,
        },
        privacy: {
          showProgress: this.profile.user_settings.show_progress,
          showAchievements: false
        }
      }
    },

    async loadStats() {
      if (!this.user) return

      try {
        // Получаем все завершенные попытки
        const { data: attempts, error } = await supabase
            .from('attempts')
            .select('score, started_at')
            .eq('user_id', this.user.id)
            .eq('status', 'completed')
            .order('started_at', { ascending: true })


        console.log(attempts)
        if (error) throw error

        const testsPassed = attempts?.length || 0
        const averageScore = testsPassed > 0
            ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / testsPassed)
            : 0

        // Вычисляем количество дней с первой активности
        let daysActive = 0
        if (attempts && attempts.length > 0) {
          const firstAttempt = new Date(attempts[0].started_at)
          const now = new Date()
          daysActive = Math.floor((now - firstAttempt) / (1000 * 60 * 60 * 24))
          console.log('daysActive', daysActive)
        }

        this.stats = {
          testsPassed,
          averageScore,
          daysActive
        }

      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },

    async loadRecentActivity() {
      if (!this.user) return

      try {
        const { data: attempts, error } = await supabase
            .from('attempts')
            .select(`
              score,
              completed_at,
              tests (
                title
              )
            `)
            .eq('user_id', this.user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(5)

        console.log(attempts)
        if (error) throw error

        this.recentActivity = (attempts || []).map(a => ({
          icon: '📊',
          title: a.tests?.title || 'Тест',
          date: this.formatRelativeDate(a.completed_at),
          score: `${a.score || 0}%`
        }))

      } catch (error) {
        console.error('Error loading recent activity:', error)
        this.recentActivity = []
      }
    },

    async loadUpcomingTests() {
      if (!this.user) return

      try {
        // Получаем группы студента
        const { data: userGroups, error: groupsError } = await supabase
            .from('user_groups')
            .select('group_id')
            .eq('user_id', this.user.id)

        if (groupsError) throw groupsError

        const groupIds = userGroups?.map(ug => ug.group_id) || []

        if (groupIds.length === 0) {
          this.upcomingTests = []
          return
        }

        // Получаем назначенные тесты для этих групп
        const { data: assignments, error: assignmentsError } = await supabase
            .from('test_assignments')
            .select(`
              test_id,
              deadline,
              tests (
                id,
                title
              )
            `)
            .in('group_id', groupIds)
            .gt('deadline', new Date().toISOString())
            .order('deadline', { ascending: true })
            .limit(5)

        if (assignmentsError) throw assignmentsError

        this.upcomingTests = (assignments || []).map(a => ({
          id: a.tests?.id,
          title: a.tests?.title || 'Тест',
          deadline: a.deadline
        }))

      } catch (error) {
        console.error('Error loading upcoming tests:', error)
        this.upcomingTests = []
      }
    },

    loadProgressData() {
      // Заглушка для графика прогресса
      this.progressData = [
        { label: 'Янв', value: 65 },
        { label: 'Фев', value: 72 },
        { label: 'Мар', value: 68 },
        { label: 'Апр', value: 78 },
        { label: 'Май', value: 82 },
        { label: 'Июн', value: 79 }
      ]
    },

    async loadCategoryProgress() {
      if (!this.user) return

      try {
        // В реальном проекте здесь нужно агрегировать данные по категориям
        // Пока используем заглушку
        this.categoryProgress = [
          { name: 'JavaScript', correct: 42, total: 50, percentage: 84 },
          { name: 'Python', correct: 28, total: 35, percentage: 80 },
          { name: 'Алгоритмы', correct: 15, total: 25, percentage: 60 },
          { name: 'Базы данных', correct: 18, total: 20, percentage: 90 }
        ]
      } catch (error) {
        console.error('Error loading category progress:', error)
        this.categoryProgress = []
      }
    },

    async loadRecentResults() {
      if (!this.user) return

      try {
        const { data: attempts, error } = await supabase
            .from('attempts')
            .select(`
              id,
              score,
              completed_at,
              tests (
                id,
                title
              )
            `)
            .eq('user_id', this.user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(5)

        if (error) throw error

        this.recentResults = (attempts || []).map(a => ({
          id: a.id,
          title: a.tests?.title || 'Тест',
          date: a.completed_at,
          score: a.score || 0
        }))

      } catch (error) {
        console.error('Error loading recent results:', error)
        this.recentResults = []
      }
    },

    async loadAchievements() {
      if (!this.user) return

      try {
        // Получаем достижения пользователя
        const { data: userAchievements, error } = await supabase
            .from('user_achievements')
            .select(`
              achievement_id,
              earned_at,
              achievements (
                id,
                name,
                description,
                icon
              )
            `)
            .eq('user_id', this.user.id)

        if (error) throw error

        const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])

        // Заглушка для списка всех достижений
        const allAchievements = [
          { id: 1, icon: '🏆', title: 'Первые шаги', description: 'Пройден первый тест' },
          { id: 2, icon: '⚡', title: 'Скорость', description: '10 тестов за месяц' },
          { id: 3, icon: '🎯', title: 'Точность', description: '90%+ правильных ответов в 5 тестах' },
          { id: 4, icon: '📚', title: 'Эрудит', description: 'Пройдены тесты из 5 разных категорий' },
          { id: 5, icon: '🔥', title: 'Стрик', description: '30 дней подряд на платформе' },
          { id: 6, icon: '👑', title: 'Лидер', description: 'Лучший результат в группе' }
        ]

        this.achievements = allAchievements.map(ach => ({
          ...ach,
          unlocked: unlockedIds.has(ach.id)
        }))

      } catch (error) {
        console.error('Error loading achievements:', error)
        this.achievements = []
      }
    },

    formatRelativeDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Сегодня'
      if (diffDays === 1) return 'Вчера'
      if (diffDays < 7) return `${diffDays} дня назад`
      return date.toLocaleDateString('ru-RU')
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    editProfile() {
      this.editForm = {
        first_name: this.profile.first_name || '',
        last_name: this.profile.last_name || '',
        patronymic: this.profile.patronymic || '',
        group_name: this.profile.group_name || '',
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
              group_name: this.editForm.group_name,
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
              group_name: this.settingsForm.group_name,
              bio: this.settingsForm.bio,
              updated_at: new Date().toISOString()
            })
            .eq('id', this.user.id)

        if (error) throw error

        // Здесь также нужно сохранять настройки уведомлений

        console.log(this.settingsForm.notifications.email)
        console.log(this.settingsForm.notifications.results)
        console.log(this.settingsForm.notifications.reminders)
        console.log(this.user.id)
        const { error1 } = await supabase
            .from('user_settings')
            .update({
              email_notifications:this.settingsForm.notifications.email,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', this.user.id)

        console.log(error1)
        if (error1) throw error1
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
        group_name: this.profile.group_name || '',
        bio: this.profile.bio || '',
        notifications: {
          email: true,
          results: true,
          reminders: false
        },
        privacy: {
          showProgress: true,
          showAchievements: false
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

    startTest(testId) {
      this.$router.push(`/test/${testId}`)
    },

    viewResult(attemptId) {
      this.$router.push(`/test/${attemptId}/results`)
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

.no-data-message {
  padding: 20px;
  text-align: center;
  color: #999;
  background: #f5f5f5;
  border: 1px solid #eee;
}

.student-bio {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

/* Остальные стили остаются без изменений */
.student-profile {
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

.profile-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

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

.student-name {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.student-email {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.student-group {
  color: #999;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-stats-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  margin-bottom: 16px;
}

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

.recent-activity,
.upcoming-tests {
  margin-bottom: 32px;
}

.recent-activity h3,
.upcoming-tests h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f5f5f5;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-meta {
  font-size: 0.85rem;
  color: #999;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f5f5f5;
}

.upcoming-icon {
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.upcoming-details {
  flex: 1;
}

.upcoming-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.upcoming-meta {
  font-size: 0.85rem;
  color: #999;
}

.progress-chart {
  margin-bottom: 32px;
}

.progress-chart h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.chart-placeholder {
  height: 200px;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #eee;
  display: flex;
  align-items: flex-end;
}

.mini-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
}

.chart-bar {
  width: 40px;
  background: #111;
  position: relative;
  transition: height 0.3s ease;
}

.bar-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #999;
}

.category-progress {
  margin-bottom: 32px;
}

.category-progress h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  padding: 12px;
  border: 1px solid #f5f5f5;
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.category-name {
  font-size: 0.95rem;
  color: #666;
}

.category-score {
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #f5f5f5;
}

.progress-fill {
  height: 100%;
  background: #111;
  transition: width 0.3s ease;
}

.recent-results h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th {
  text-align: left;
  padding: 12px 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #999;
  border-bottom: 1px solid #eee;
}

.results-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f5f5f5;
}

.result-badge {
  padding: 2px 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.result-badge.good {
  background: #e8f5e9;
  color: #2e7d32;
}

.result-badge.medium {
  background: #fff3e0;
  color: #f57c00;
}

.result-badge.bad {
  background: #ffebee;
  color: #c62828;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #eee;
  position: relative;
  transition: all 0.2s;
}

.achievement-card.unlocked {
  background: #fafafa;
}

.achievement-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #eee;
}

.achievement-info {
  flex: 1;
}

.achievement-info h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.achievement-info p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.achievement-check,
.achievement-lock {
  font-size: 1.2rem;
  opacity: 0.5;
}

.achievement-check {
  color: #4caf50;
}

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

.empty-state {
  padding: 32px;
  text-align: center;
  border: 1px solid #eee;
  color: #999;
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    position: static;
  }

  .achievements-grid {
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

  .results-table {
    display: block;
    overflow-x: auto;
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