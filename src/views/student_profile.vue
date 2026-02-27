<template>
  <div class="student-profile">
    <!-- Навигация -->
    <app-navigation></app-navigation>

    <!-- Основной контент -->
    <main class="profile-main">
      <div class="container">
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
                    v-if="student.avatar"
                    :src="student.avatar"
                    :alt="student.name"
                    class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  {{ student.initials }}
                </div>
                <button class="avatar-edit" @click="openAvatarUpload">
                  <span class="edit-icon">✎</span>
                </button>
              </div>
              <h2 class="student-name">{{ student.name }}</h2>
              <p class="student-email">{{ student.email }}</p>
              <p class="student-group">{{ student.group }}</p>
            </div>

            <div class="profile-stats-mini">
              <div class="mini-stat">
                <span class="mini-stat-value">{{ student.testsPassed }}</span>
                <span class="mini-stat-label">Тестов пройдено</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-value">{{ student.averageScore }}%</span>
                <span class="mini-stat-label">Средний результат</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-value">{{ student.daysActive }}</span>
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
                  <div class="activity-list">
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
                        <p class="upcoming-meta">Дедлайн: {{ test.deadline }}</p>
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
                    <!-- Здесь будет график -->
                    <div class="mini-chart">
                      <div v-for="(point, index) in progressData" :key="index"
                           class="chart-bar"
                           :style="{ height: point + '%' }">
                        <span class="bar-label">{{ 80 + index * 5 }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="category-progress">
                  <h3>Прогресс по категориям</h3>
                  <div class="category-list">
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
                  <table class="results-table">
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
                      <td>{{ result.date }}</td>
                      <td>
                          <span class="result-badge" :class="{ 'good': result.score >= 80, 'medium': result.score >= 60 && result.score < 80, 'bad': result.score < 60 }">
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
                <div class="achievements-grid">
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
                      <label for="name">Имя</label>
                      <input
                          type="text"
                          id="name"
                          v-model="settings.name"
                          class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label for="email">Email</label>
                      <input
                          type="email"
                          id="email"
                          v-model="settings.email"
                          class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label for="group">Группа</label>
                      <input
                          type="text"
                          id="group"
                          v-model="settings.group"
                          class="form-input"
                      />
                    </div>
                  </div>

                  <div class="settings-section">
                    <h3>Уведомления</h3>

                    <label class="checkbox">
                      <input type="checkbox" v-model="settings.notifications.email" />
                      <span>Получать уведомления о новых тестах по email</span>
                    </label>

                    <label class="checkbox">
                      <input type="checkbox" v-model="settings.notifications.results" />
                      <span>Уведомлять о результатах тестов</span>
                    </label>

                    <label class="checkbox">
                      <input type="checkbox" v-model="settings.notifications.reminders" />
                      <span>Напоминания о дедлайнах</span>
                    </label>
                  </div>

                  <div class="settings-section">
                    <h3>Конфиденциальность</h3>

                    <label class="checkbox">
                      <input type="checkbox" v-model="settings.privacy.showProgress" />
                      <span>Показывать мой прогресс другим студентам группы</span>
                    </label>

                    <label class="checkbox">
                      <input type="checkbox" v-model="settings.privacy.showAchievements" />
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
      </div>
    </main>

    <!-- Модальное окно редактирования профиля -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal edit-modal">
        <h2 class="modal-title">Редактировать профиль</h2>

        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-group">
            <label for="edit-name">Имя</label>
            <input type="text" id="edit-name" v-model="editForm.name" class="form-input" />
          </div>

          <div class="form-group">
            <label for="edit-email">Email</label>
            <input type="email" id="edit-email" v-model="editForm.email" class="form-input" />
          </div>

          <div class="form-group">
            <label for="edit-group">Группа</label>
            <input type="text" id="edit-group" v-model="editForm.group" class="form-input" />
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

      // Данные студента
      student: {
        id: 1,
        name: 'Алексей Иванов',
        initials: 'АИ',
        email: 'alexey.ivanov@example.com',
        group: 'Группа ПИ-201',
        avatar: null,
        testsPassed: 42,
        averageScore: 78,
        daysActive: 156,
        bio: 'Студент 3 курса, увлекаюсь веб-разработкой'
      },

      // Форма редактирования
      editForm: {
        name: '',
        email: '',
        group: '',
        bio: ''
      },

      // Настройки
      settings: {
        name: 'Алексей Иванов',
        email: 'alexey.ivanov@example.com',
        group: 'Группа ПИ-201',
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
      },

      // Недавняя активность
      recentActivity: [
        { icon: '📊', title: 'Основы JavaScript', date: '2 дня назад', score: '84%' },
        { icon: '📝', title: 'Python для начинающих', date: '5 дней назад', score: '92%' },
        { icon: '🧮', title: 'Линейная алгебра', date: '1 неделя назад', score: '67%' },
        { icon: '🌐', title: 'Английский Intermediate', date: '2 недели назад', score: '78%' }
      ],

      // Предстоящие тесты
      upcomingTests: [
        { id: 1, title: 'Продвинутый JavaScript', deadline: '25 марта 2026' },
        { id: 2, title: 'Алгоритмы и структуры данных', deadline: '1 апреля 2026' }
      ],

      // Данные для графика прогресса
      progressData: [65, 72, 68, 78, 82, 79, 84, 88, 85, 90],

      // Прогресс по категориям
      categoryProgress: [
        { name: 'JavaScript', correct: 42, total: 50, percentage: 84 },
        { name: 'Python', correct: 28, total: 35, percentage: 80 },
        { name: 'Алгоритмы', correct: 15, total: 25, percentage: 60 },
        { name: 'Базы данных', correct: 18, total: 20, percentage: 90 },
        { name: 'HTML/CSS', correct: 22, total: 25, percentage: 88 }
      ],

      // Последние результаты
      recentResults: [
        { id: 1, title: 'Основы JavaScript', date: '15.03.2026', score: 84 },
        { id: 2, title: 'Python для начинающих', date: '12.03.2026', score: 92 },
        { id: 3, title: 'Линейная алгебра', date: '08.03.2026', score: 67 },
        { id: 4, title: 'Английский Intermediate', date: '05.03.2026', score: 78 }
      ],

      // Достижения
      achievements: [
        { id: 1, icon: '🏆', title: 'Первые шаги', description: 'Пройден первый тест', unlocked: true },
        { id: 2, icon: '⚡', title: 'Скорость', description: '10 тестов за месяц', unlocked: true },
        { id: 3, icon: '🎯', title: 'Точность', description: '90%+ правильных ответов в 5 тестах', unlocked: true },
        { id: 4, icon: '📚', title: 'Эрудит', description: 'Пройдены тесты из 5 разных категорий', unlocked: false },
        { id: 5, icon: '🔥', title: 'Стрик', description: '30 дней подряд на платформе', unlocked: false },
        { id: 6, icon: '👑', title: 'Лидер', description: 'Лучший результат в группе', unlocked: false }
      ]
    }
  },
  created() {
    this.loadProfile()
    this.initEditForm()
  },
  methods: {
    loadProfile() {
      // Загрузка профиля с API или из localStorage
      const saved = localStorage.getItem('student_profile')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          this.student = { ...this.student, ...data }
          this.settings = { ...this.settings, ...data.settings }
        } catch (e) {
          console.error('Failed to load profile:', e)
        }
      }
    },

    initEditForm() {
      this.editForm = {
        name: this.student.name,
        email: this.student.email,
        group: this.student.group,
        bio: this.student.bio
      }
    },

    editProfile() {
      this.initEditForm()
      this.showEditModal = true
    },

    saveProfile() {
      this.student.name = this.editForm.name
      this.student.email = this.editForm.email
      this.student.group = this.editForm.group
      this.student.bio = this.editForm.bio

      // Сохраняем в localStorage
      localStorage.setItem('student_profile', JSON.stringify(this.student))

      this.showEditModal = false
    },

    openAvatarUpload() {
      console.log('Open avatar upload')
      // Здесь будет логика загрузки аватара
    },

    saveSettings() {
      this.student.name = this.settings.name
      this.student.email = this.settings.email
      this.student.group = this.settings.group

      // Сохраняем настройки
      localStorage.setItem('student_profile', JSON.stringify({
        ...this.student,
        settings: this.settings
      }))

      alert('Настройки сохранены')
    },

    resetSettings() {
      this.settings = {
        name: this.student.name,
        email: this.student.email,
        group: this.student.group,
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

    changePassword() {
      if (this.passwordData.new !== this.passwordData.confirm) {
        alert('Пароли не совпадают')
        return
      }

      if (this.passwordData.new.length < 6) {
        alert('Пароль должен быть не менее 6 символов')
        return
      }

      console.log('Changing password...')
      // Здесь будет запрос на смену пароля

      this.passwordData = {
        current: '',
        new: '',
        confirm: ''
      }

      alert('Пароль успешно изменен')
    },

    startTest(testId) {
      this.$router.push(`/test/${testId}`)
    },

    viewResult(resultId) {
      this.$router.push(`/test/${resultId}/results`)
    }
  }
}
</script>

<style scoped>
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
  grid-template-columns: 280px 1fr;
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

.avatar-edit:hover {
  border-color: #111;
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

/* Вкладка Обзор */
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

/* Вкладка Прогресс */
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
  width: 30px;
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

/* Вкладка Достижения */
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

/* Вкладка Настройки */
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
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 450;
  margin-bottom: 24px;
}

.edit-form {
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

/* Пустое состояние */
.empty-state {
  padding: 32px;
  text-align: center;
  border: 1px solid #eee;
  color: #999;
}

/* Адаптивность */
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