<template>
  <div class="not-found">
    <!-- Навигация (опционально, чтобы можно было уйти со страницы) -->
    <nav class="nav">
      <div class="nav-container">
        <a href="/" class="nav-logo">Нетеста</a>
        <div class="nav-menu">
          <a href="/" class="nav-link">Главная</a>
          <a href="/login" class="nav-link">Вход</a>
          <a href="/register" class="btn btn-primary btn-sm">Регистрация</a>
        </div>
      </div>
    </nav>

    <!-- Основной контент 404 -->
    <main class="not-found-main">
      <div class="container">
        <div class="not-found-content">
          <h1 class="not-found-title">404</h1>
          <p class="not-found-subtitle">Страница не найдена</p>
          <p class="not-found-text">
            Возможно, она была удалена или вы перешли по неверной ссылке.
          </p>
          <div class="not-found-actions">
            <a href="/" class="btn btn-primary">Вернуться на главную</a>
            <a href="/" class="btn btn-outline">Назад</a>
          </div>
        </div>
      </div>
    </main>

    <!-- Простой футер -->
    <footer class="footer">
      <div class="container">
        <p class="copyright">© 2026 Нетеста</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  metaInfo: {
    title: '404 — Страница не найдена | Нетеста',
  },
}
</script>

<style scoped>
/* Базовые стили */
.not-found {
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

/* Навигация */
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
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #111;
}

/* Основной контент 404 */
.not-found-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 0 80px;
  background: #fafafa;
}

.not-found-content {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.not-found-title {
  font-size: 8rem;
  font-weight: 450;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 1rem;
  color: #111;
}

.not-found-subtitle {
  font-size: 1.5rem;
  font-weight: 450;
  margin-bottom: 1rem;
  color: #333;
}

.not-found-text {
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 1rem;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Кнопки */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
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

/* Футер */
.footer {
  padding: 30px 0;
  background: white;
  border-top: 1px solid #eee;
}

.copyright {
  color: #999;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .not-found-title {
    font-size: 6rem;
  }

  .not-found-subtitle {
    font-size: 1.25rem;
  }

  .not-found-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-menu {
    display: none;
  }
}
</style>