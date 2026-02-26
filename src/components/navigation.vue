<template>
  <nav class="nav">
    <div class="nav-container">
      <a href="/" class="nav-logo">Нетеста</a>

      <!-- Desktop Menu -->
      <div class="nav-menu">
        <a href="/" class="nav-link">Главная</a>
        <a href="#about" class="nav-link">О нас</a>
        <a href="#features" class="nav-link">Возможности</a>
        <a href="#stats" class="nav-link">Статистика</a>
      </div>

      <div class="nav-actions">
        <button @click="openLoginModal" class="nav-link btn-link">Вход</button>
        <button @click="openRegisterModal" class="btn btn-primary btn-sm">
          Регистрация
        </button>
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
        <a href="#about" class="mobile-link" @click="toggleMobileMenu">О нас</a>
        <a href="#features" class="mobile-link" @click="toggleMobileMenu">Возможности</a>
        <a href="#stats" class="mobile-link" @click="toggleMobileMenu">Статистика</a>
        <div class="mobile-actions">
          <button @click="openLoginModal" class="btn btn-outline btn-block">
            Вход
          </button>
          <button @click="openRegisterModal" class="btn btn-primary btn-block">
            Регистрация
          </button>
        </div>
      </div>
    </div>

    <!-- Модальные окна -->
    <LoginModal
        v-if="showLoginModal"
        @close="showLoginModal = false"
        @switch-to-register="switchToRegister"
    />

    <RegisterModal
        v-if="showRegisterModal"
        @close="showRegisterModal = false"
        @switch-to-login="switchToLogin"
    />
  </nav>
</template>

<script>
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
    }
  },
  methods: {
    openLoginModal() {
      this.showLoginModal = true
      this.showRegisterModal = false
      this.mobileMenuOpen = false
    },
    openRegisterModal() {
      this.showRegisterModal = true
      this.showLoginModal = false
      this.mobileMenuOpen = false
    },
    switchToLogin() {
      this.showRegisterModal = false
      this.showLoginModal = true
    },
    switchToRegister() {
      this.showLoginModal = false
      this.showRegisterModal = true
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
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