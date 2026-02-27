<template>
  <nav class="nav">
    <div class="nav-container">
      <a href="/" class="nav-logo">Нетеста</a>

      <!-- Desktop Menu -->
      <div class="nav-menu">
        <a href="/" class="nav-link">Главная</a>
        <a href="/tests" class="nav-link">Тесты</a>
        <a href="#features" class="nav-link">Возможности</a>
        <a href="#stats" class="nav-link">Статистика</a>
        <a v-if="isTeacher" href="/teacher/tests" class="nav-link">Панель преподавателя</a>
      </div>

      <!-- Desktop Actions -->
      <div class="nav-actions">
        <template v-if="user">
          <!-- Пользователь авторизован -->
          <div class="user-menu">
            <button @click="toggleUserMenu" class="user-button">
              <span class="user-avatar">{{ userInitials }}</span>
              <span class="user-name">{{ userFullName }}</span>
              <span class="user-arrow">▼</span>
            </button>
            <div v-if="userMenuOpen" class="user-dropdown">
              <!-- Динамический переход на профиль в зависимости от роли -->
              <router-link
                  :to="profileLink"
                  class="dropdown-item"
                  @click="userMenuOpen = false"
              >
                <span>👤</span> {{ profileLinkText }}
              </router-link>

              <!-- Ссылка на панель преподавателя (только для учителей) -->
              <router-link
                  v-if="isTeacher"
                  to="/teacher/tests"
                  class="dropdown-item"
                  @click="userMenuOpen = false"
              >
                <span>📋</span> Мои тесты
              </router-link>

              <!-- Кнопка выхода -->
              <a href="#" @click.prevent="logout" class="dropdown-item logout">
                <span>🚪</span> Выйти
              </a>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- Пользователь не авторизован -->
          <button @click="openLoginModal" class="nav-link btn-link">Вход</button>
          <button @click="openRegisterModal" class="btn btn-primary btn-sm">
            Регистрация
          </button>
        </template>
      </div>

      <!-- Mobile Toggle -->
      <button class="nav-toggle" @click="toggleMobileMenu" aria-label="Меню">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu-header">
        <span class="nav-logo">Нетеста</span>
        <button class="mobile-close" @click="toggleMobileMenu">×</button>
      </div>
      <div class="mobile-menu-content">
        <a href="/" class="mobile-link" @click="toggleMobileMenu">Главная</a>
        <a href="/tests" class="mobile-link" @click="toggleMobileMenu">Тесты</a>
        <a href="#features" class="mobile-link" @click="toggleMobileMenu">Возможности</a>
        <a href="#stats" class="mobile-link" @click="toggleMobileMenu">Статистика</a>
        <a v-if="isTeacher" href="/teacher/tests" class="mobile-link" @click="toggleMobileMenu">
          Панель преподавателя
        </a>

        <div class="mobile-actions">
          <template v-if="user">
            <!-- Мобильное меню для авторизованного пользователя -->
            <div class="mobile-user-info">
              <span class="mobile-user-avatar">{{ userInitials }}</span>
              <span class="mobile-user-name">{{ userFullName }}</span>
            </div>
            <router-link to="/profile" class="btn btn-outline btn-block" @click="toggleMobileMenu">
              Профиль
            </router-link>
            <button @click="logout" class="btn btn-outline btn-block">
              Выйти
            </button>
          </template>
          <template v-else>
            <!-- Мобильное меню для неавторизованного пользователя -->
            <button @click="openLoginModal" class="btn btn-outline btn-block">
              Вход
            </button>
            <button @click="openRegisterModal" class="btn btn-primary btn-block">
              Регистрация
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Модальные окна -->
    <LoginModal
        v-if="showLoginModal"
        @close="showLoginModal = false"
        @switch-to-register="switchToRegister"
        @login-success="handleLoginSuccess"
    />

    <RegisterModal
        v-if="showRegisterModal"
        @close="showRegisterModal = false"
        @switch-to-login="switchToLogin"
    />
  </nav>
</template>

<script>
import { supabase } from '@/lib/supabase'
import LoginModal from './login_modal.vue'
import RegisterModal from './register_modal.vue'

export default {
  name: 'AppNavigation',
  components: {
    LoginModal,
    RegisterModal,
  },
  data() {
    return {
      showLoginModal: false,
      showRegisterModal: false,
      mobileMenuOpen: false,
      userMenuOpen: false,
      user: null,
      userProfile: null,
    }
  },
  computed: {
    profileLink() {
      if (this.isTeacher) {
        return '/teacher/profile' // или '/teacher' если у вас там профиль
      }
      return '/profile' // для студентов
    },

    // Текст для пункта меню
    profileLinkText() {
      if (this.isTeacher) {
        return 'Профиль преподавателя'
      }
      return 'Профиль студента'
    },

    // Проверка на преподавателя

    userFullName() {
      if (this.userProfile) {
        return `${this.userProfile.first_name || ''} ${this.userProfile.last_name || ''}`.trim() || 'Пользователь'
      }
      return this.user?.email?.split('@')[0] || 'Пользователь'
    },
    userInitials() {
      if (this.userProfile?.first_name && this.userProfile?.last_name) {
        return (this.userProfile.first_name[0] + this.userProfile.last_name[0]).toUpperCase()
      }
      return this.user?.email?.[0]?.toUpperCase() || '?'
    },
    isTeacher() {
      return this.userProfile?.role === 'teacher' || this.userProfile?.role === 'admin'
    }
  },
  async created() {
    // Получаем текущую сессию
    const { data: { session } } = await supabase.auth.getSession()
    this.user = session?.user || null

    if (this.user) {
      await this.loadUserProfile()
    }

    // Слушаем изменения авторизации
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null
      if (this.user) {
        this.loadUserProfile()
      } else {
        this.userProfile = null
      }
    })

    // Закрываем меню при клике вне
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async loadUserProfile() {
      if (!this.user) return

      try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', this.user.id)
            .single()

        if (error) throw error
        this.userProfile = data
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    },

    openLoginModal() {
      this.showLoginModal = true
      this.showRegisterModal = false
      this.mobileMenuOpen = false
      this.userMenuOpen = false
    },

    openRegisterModal() {
      this.showRegisterModal = true
      this.showLoginModal = false
      this.mobileMenuOpen = false
      this.userMenuOpen = false
    },

    switchToLogin() {
      this.showRegisterModal = false
      this.showLoginModal = true
    },

    switchToRegister() {
      this.showLoginModal = false
      this.showRegisterModal = true
    },

    handleLoginSuccess({ user, role }) {
      this.user = user
      this.loadUserProfile()
      this.showLoginModal = false
    },

    async logout() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.userProfile = null
        this.userMenuOpen = false
        this.mobileMenuOpen = false

        // Перенаправляем на главную
        if (this.$route.path !== '/') {
          this.$router.push('/')

        }
      } catch (error) {
        console.error('Error logging out:', error)
      }
    },

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      if (!this.mobileMenuOpen) {
        this.userMenuOpen = false
      }
    },

    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },

    handleClickOutside(event) {
      const userMenu = document.querySelector('.user-menu')
      if (userMenu && !userMenu.contains(event.target)) {
        this.userMenuOpen = false
      }
    },
  },
  watch: {
    mobileMenuOpen(open) {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
  },
}
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #eee;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 500;
  text-decoration: none;
  color: #111;
  letter-spacing: -0.02em;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 0.95rem;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.nav-link:hover {
  color: #111;
}

.btn-link {
  font-size: 0.95rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* User Menu Styles */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #eee;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.user-button:hover {
  border-color: #111;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.user-name {
  font-size: 0.9rem;
  color: #111;
}

.user-arrow {
  font-size: 0.8rem;
  color: #999;
  margin-left: 4px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 200px;
  background: white;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 101;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  text-decoration: none;
  color: #666;
  font-size: 0.9rem;
  transition: all 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #fafafa;
  color: #111;
}

.dropdown-item.logout:hover {
  color: #f44336;
}

.dropdown-item span {
  font-size: 1.1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
  background: none;
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

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
}

.btn-block {
  width: 100%;
}

/* Mobile Toggle */
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.nav-toggle span {
  width: 24px;
  height: 1px;
  background: #111;
  transition: 0.3s;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 200;
  padding: 24px;
  overflow-y: auto;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.mobile-close {
  font-size: 2rem;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0;
}

.mobile-close:hover {
  color: #111;
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mobile-link {
  text-decoration: none;
  color: #111;
  font-size: 1.25rem;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #eee;
  margin-bottom: 8px;
}

.mobile-user-avatar {
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 500;
  color: #666;
}

.mobile-user-name {
  font-size: 1rem;
  font-weight: 500;
  color: #111;
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-menu,
  .nav-actions {
    display: none;
  }

  .nav-toggle {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }
}
</style>