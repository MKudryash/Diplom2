<template>
  <div class="teacher-layout">
    <!-- Навигация (общая для всех страниц) -->
    <app-navigation></app-navigation>

    <!-- Специфичная для преподавателя навигация -->
    <nav class="teacher-nav">
      <div class="container">
        <div class="teacher-nav-container">
          <div class="teacher-nav-links">
            <router-link
                to="/teacher/tests"
                class="nav-link"
                active-class="active"
            >
              📋 Мои тесты
            </router-link>
            <router-link
                to="/teacher/groups"
                class="nav-link"
                active-class="active"
            >
              👥 Группы
            </router-link>
          </div>

          <div class="teacher-quick-actions">
            <button @click="createNewTest" class="btn btn-primary btn-sm">
              + Новый тест
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Основной контент (слот для дочерних страниц) -->
    <main class="teacher-content">
      <!-- ОТОБРАЖЕНИЕ ДОЧЕРНИХ КОМПОНЕНТОВ -->
      <router-view></router-view>
    </main>

  </div>
</template>

<script>
import AppNavigation from '../components/navigation'
import AppFooter from '../components/footer'

export default {
  name: 'TeacherLayout',
  components: {
    AppNavigation,
    AppFooter,
  },
  methods: {
    createNewTest() {
      const targetPath = '/teacher/test/new/edit'
      const currentPath = this.$route.path

      // Проверяем, не находимся ли мы уже на странице создания нового теста
      if (currentPath === targetPath) {
        console.log('Уже на странице создания теста')
        return
      }

      // Используем catch для игнорирования ошибки дублирования
      this.$router.push(targetPath).catch(err => {
        // Игнорируем ошибку навигации на текущий маршрут
        if (err.name !== 'NavigationDuplicated') {
          console.error('Ошибка навигации:', err)
        }
      })
    }
  }
}
</script>

<style scoped>
.teacher-layout {
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

/* Специфичная навигация преподавателя */
.teacher-nav {
  position: sticky;
  top: 70px; /* Высота основной навигации */
  z-index: 90;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.teacher-nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.teacher-nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 0.95rem;
  padding: 4px 0;
  position: relative;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #111;
}

.nav-link.active {
  color: #111;
  font-weight: 500;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0;
  right: 0;
  height: 2px;
  background: #111;
}

.teacher-quick-actions {
  display: flex;
  gap: 12px;
}

/* Основной контент */
.teacher-content {
  flex: 1;
  padding: 40px 0 60px;
}

/* Кнопки */
.btn {
  display: inline-block;
  padding: 8px 16px;
  text-decoration: none;
  font-size: 0.9rem;
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

.btn-primary:hover {
  background: #333;
  border-color: #333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .teacher-nav-container {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .teacher-nav-links {
    width: 100%;
    justify-content: space-between;
    gap: 0;
  }

  .nav-link.active::after {
    bottom: -13px;
  }
}
</style>